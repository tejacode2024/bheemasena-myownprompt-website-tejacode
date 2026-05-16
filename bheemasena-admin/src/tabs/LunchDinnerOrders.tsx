import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Search, RefreshCw, Download, Trash2, Sun, Moon, ShoppingBag, IndianRupee, CheckCircle2 } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { OrderCard } from '../components/orders/OrderCard'
import { UpdateModal } from '../components/orders/UpdateModal'
import { PayModal } from '../components/orders/PayModal'
import { DeleteConfirm } from '../components/orders/DeleteConfirm'
import { useOrdersStore } from '../state/ordersStore'
import { useAdminStore } from '../state/adminStore'
import { useUIStore } from '../state/uiStore'
import { api, type RawOrder } from '../lib/api'
import { fmtMoney } from '../lib/format'
import { loadExcelJS, triggerDownload } from '../lib/excel'

const POLL_MS = 8000

export function LunchDinnerOrders({ session }: { session: 'lunch' | 'dinner' }) {
  const orders = useOrdersStore(s => s.orders)
  const mergeOrders = useOrdersStore(s => s.mergeOrders)
  const setOrders = useOrdersStore(s => s.setOrders)
  const patchLocal = useOrdersStore(s => s.patchLocal)
  const secret = useAdminStore(s => s.secret)
  const toast = useUIStore(s => s.addToast)

  const [search, setSearch] = useState('')
  const [hasExported, setHasExported] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editTarget, setEditTarget] = useState<RawOrder | null>(null)
  const [payTarget, setPayTarget]   = useState<RawOrder | null>(null)
  const [delTarget, setDelTarget]   = useState<RawOrder | null>(null)

  useEffect(() => {
    let mounted = true
    async function tick() {
      try {
        const fresh = await api.fetchOrders(secret)
        if (!mounted) return
        if (useOrdersStore.getState().orders.length === 0) setOrders(fresh)
        else mergeOrders(fresh)
      } catch { /* ignore */ }
    }
    tick()
    const t = setInterval(tick, POLL_MS)
    return () => { mounted = false; clearInterval(t) }
  }, [secret, mergeOrders, setOrders])

  const sessionOrders = useMemo(() => {
    return orders.filter(o => o.session_type === session)
  }, [orders, session])

  const filtered = useMemo(() => {
    if (!search.trim()) return sessionOrders
    const q = search.trim().toLowerCase()
    return sessionOrders.filter(o =>
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      String(o.token_number).includes(q.replace(/^#/, '')),
    )
  }, [sessionOrders, search])

  const pending = filtered.filter(o => o.deliver_status !== 'delivered')
  const delivered = filtered.filter(o => o.deliver_status === 'delivered')
  const revenue = filtered.reduce((s, o) => s + o.total, 0)

  async function refresh() {
    setRefreshing(true)
    try {
      const fresh = await api.fetchOrders(secret)
      mergeOrders(fresh)
      toast('Refreshed', 'success')
    } catch { toast('Refresh failed', 'error') }
    finally { setRefreshing(false) }
  }

  async function deliverAll() {
    if (pending.length === 0) return
    if (!confirm(`Mark all ${pending.length} pending orders as delivered?`)) return
    try {
      await Promise.all(pending.map(o =>
        api.patchOrder(o.token_number, { deliver_status: 'delivered', pay_status: 'paid' }, secret)
          .then(() => patchLocal(o.token_number, { deliver_status: 'delivered', pay_status: 'paid', delivered_at: new Date().toISOString() })),
      ))
      toast(`Delivered ${pending.length} orders`, 'success')
    } catch { toast('Some orders failed to deliver', 'error') }
  }

  async function exportXLSX() {
    try {
      const ExcelJS = await loadExcelJS()
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet(session)
      ws.columns = [
        { width: 8 }, { width: 22 }, { width: 14 }, { width: 40 }, { width: 6 },
        { width: 14 }, { width: 10 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 20 }, { width: 20 },
      ]
      ws.mergeCells('A1:L1')
      const title = ws.getCell('A1')
      title.value = `BHEEMASENA — ${session === 'lunch' ? 'Lunch' : 'Dinner'} | ${new Date().toLocaleDateString()}`
      title.font = { bold: true, size: 14 }
      const headers = ['Token','Name','Phone','Item','Qty','Payment','Total','Pay Status','Pending','Deliver','Created','Delivered At']
      const headerRow = ws.getRow(3)
      headers.forEach((h, i) => {
        const c = headerRow.getCell(i + 1)
        c.value = h; c.font = { bold: true }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF8F3' } }
      })
      let idx = 4
      for (const o of sessionOrders) {
        const items = Array.isArray(o.items) ? o.items : []
        if (items.length === 0) {
          ws.getRow(idx++).values = [`#${String(o.token_number).padStart(3,'0')}`, o.customer_name, o.customer_phone, '', '', o.payment_mode, o.total, o.pay_status, o.pending_amount ?? '', o.deliver_status, o.created_at, o.delivered_at ?? '']
          continue
        }
        items.forEach((it, j) => {
          ws.getRow(idx++).values = [
            j === 0 ? `#${String(o.token_number).padStart(3,'0')}` : '',
            j === 0 ? o.customer_name : '',
            j === 0 ? o.customer_phone : '',
            it.name, it.qty,
            j === 0 ? o.payment_mode : '',
            j === 0 ? o.total : '',
            j === 0 ? o.pay_status : '',
            j === 0 ? (o.pending_amount ?? '') : '',
            j === 0 ? o.deliver_status : '',
            j === 0 ? o.created_at : '',
            j === 0 ? (o.delivered_at ?? '') : '',
          ]
        })
      }
      const buf = await wb.xlsx.writeBuffer()
      const today = new Date().toISOString().slice(0,10)
      triggerDownload(buf, `bheemasena-${session}-${today}.xlsx`)
      setHasExported(true)
      toast('Export ready', 'success')
    } catch { toast('Export failed', 'error') }
  }

  async function clearAll() {
    if (!hasExported) return
    if (!confirm(`Archive all ${sessionOrders.length} ${session} orders?`)) return
    try {
      await api.clearAllOrders(secret)
      const next = orders.filter(o => o.session_type !== session)
      useOrdersStore.setState({ orders: next })
      toast('Orders archived', 'success')
      setHasExported(false)
    } catch { toast('Clear failed', 'error') }
  }

  const sessionTag = session === 'lunch'
    ? { Icon: Sun, label: 'Lunch · Before 14:00 IST', color: 'rgba(160,123,42,0.10)', text: 'var(--color-warning)' }
    : { Icon: Moon, label: 'Dinner · After 14:00 IST', color: 'rgba(56,72,140,0.08)', text: '#3D4A7C' }

  const TagIcon = sessionTag.Icon

  return (
    <div style={{ padding: 'clamp(16px,3vw,24px)', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: sessionTag.color, color: sessionTag.text,
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            border: '1px solid currentColor', borderColor: 'transparent',
          }}
        >
          <TagIcon size={12} strokeWidth={1.5} />
          {sessionTag.label}
        </span>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
          {filtered.length} orders · {pending.length} pending
        </div>
      </div>

      <div style={{ marginBottom: 12, position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', top: 17, left: 12, color: 'var(--color-muted)' }} />
        <input
          className="admin-input"
          placeholder="Search by name, phone, or #token…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {pending.length > 0 && (
        <button type="button" className="pill-btn pill-success" onClick={deliverAll}
          style={{ width: '100%', height: 48, marginBottom: 12 }}>
          Deliver all — {pending.length} pending
        </button>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className="pill-btn pill-ghost" onClick={refresh} disabled={refreshing}>
          <RefreshCw size={12} className={refreshing ? 'bhm-spin' : ''} /> Refresh
        </button>
        <button type="button" className="pill-btn pill-accent" onClick={exportXLSX} disabled={sessionOrders.length === 0}>
          <Download size={12} /> Export
        </button>
        <button type="button" className="pill-btn pill-danger" onClick={clearAll} disabled={!hasExported || sessionOrders.length === 0}>
          <Trash2 size={12} /> Clear all
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        <StatCard label="Orders" value={filtered.length} compact Icon={ShoppingBag} />
        <StatCard label="Revenue" value={fmtMoney(revenue)} tone="accent" compact Icon={IndianRupee} />
        <StatCard label="Delivered" value={delivered.length} tone="success" compact Icon={CheckCircle2} />
      </div>

      {pending.length > 0 && (
        <>
          <SectionLabel tone="warning" label="Pending orders" count={pending.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {pending.map((o, i) => (
              <motion.div
                key={o.token_number}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <OrderCard
                  order={o}
                  onEdit={() => setEditTarget(o)}
                  onDelete={() => setDelTarget(o)}
                  onDeliver={() => setPayTarget(o)}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {delivered.length > 0 && (
        <>
          <SectionLabel tone="success" label="Delivered orders" count={delivered.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {delivered.map(o => (
              <OrderCard
                key={o.token_number}
                order={o}
                onEdit={() => setEditTarget(o)}
                onDelete={() => setDelTarget(o)}
              />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
          No {session} orders yet. Sit tight — the kitchen is ready.
        </div>
      )}

      {editTarget && <UpdateModal order={editTarget} open onClose={() => setEditTarget(null)} />}
      {payTarget  && <PayModal    order={payTarget}  open onClose={() => setPayTarget(null)} />}
      {delTarget  && <DeleteConfirm order={delTarget} open onClose={() => setDelTarget(null)} />}
    </div>
  )
}

function SectionLabel({ tone, label, count }: { tone: 'warning' | 'success'; label: string; count: number }) {
  const c = tone === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{
        fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: c,
      }}>
        {label}
      </span>
      <span style={{
        background: `${c}`, color: '#fff', borderRadius: 999,
        padding: '1px 8px', fontSize: 10,
      }}>
        {count}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--color-admin-border)' }} />
    </div>
  )
}
