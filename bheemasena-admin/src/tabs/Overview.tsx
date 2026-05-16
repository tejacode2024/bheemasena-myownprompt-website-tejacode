import { useMemo } from 'react'
import {
  IndianRupee, ShoppingBag, Hourglass, CheckCircle2,
  Banknote, CreditCard, Download,
} from 'lucide-react'
import { Toggle } from '../components/ui/Toggle'
import { StatCard } from '../components/ui/StatCard'
import { Tag } from '../components/ui/Tag'
import { useOrdersStore } from '../state/ordersStore'
import { useAdminStore } from '../state/adminStore'
import { useUIStore } from '../state/uiStore'
import { fmtMoney, tokenDisplay } from '../lib/format'
import { loadExcelJS, triggerDownload } from '../lib/excel'

export function OverviewTab() {
  const orders = useOrdersStore(s => s.orders)
  const siteOnline = useAdminStore(s => s.siteOnline)
  const patchConfig = useAdminStore(s => s.patchConfig)
  const toast = useUIStore(s => s.addToast)

  const stats = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.total, 0)
    const cod = orders.filter(o => o.payment_mode === 'cod').reduce((s, o) => s + o.total, 0)
    const prepaid = orders.filter(o => o.payment_mode !== 'cod').reduce((s, o) => s + o.total, 0)
    const pending = orders.filter(o => o.deliver_status !== 'delivered').length
    const delivered = orders.filter(o => o.deliver_status === 'delivered').length
    return { total, cod, prepaid, pending, delivered }
  }, [orders])

  async function toggleSite(next: boolean) {
    try { await patchConfig({ site_online: next }) }
    catch { toast('Could not update site status', 'error') }
  }

  async function exportStats() {
    try {
      const ExcelJS = await loadExcelJS()
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Today Stats')
      ws.columns = [{ width: 24 }, { width: 16 }]
      ws.addRow(['Metric', 'Value'])
      ws.addRow(['Revenue', stats.total])
      ws.addRow(['Total orders', orders.length])
      ws.addRow(['Pending', stats.pending])
      ws.addRow(['Delivered', stats.delivered])
      ws.addRow(['COD revenue', stats.cod])
      ws.addRow(['Prepaid revenue', stats.prepaid])
      ws.getRow(1).font = { bold: true }
      const buf = await wb.xlsx.writeBuffer()
      triggerDownload(buf, `bheemasena-stats-${new Date().toISOString().slice(0,10)}.xlsx`)
      toast('Stats exported', 'success')
    } catch { toast('Export failed', 'error') }
  }

  const recent = orders.slice(0, 5)

  return (
    <div style={{ padding: 'clamp(16px,3vw,24px)', maxWidth: 1000, margin: '0 auto' }}>
      <section className="admin-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, color: 'var(--color-ink)' }}>
              {siteOnline ? 'Orders open' : 'Orders closed'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
              {siteOnline ? 'Accepting new orders from the website.' : 'Cart is paused on the user site.'}
            </div>
          </div>
          <Toggle on={siteOnline} onChange={toggleSite} label="Site online" />
        </div>
        <div style={{ marginTop: 12 }}>
          <Tag tone={siteOnline ? 'online' : 'offline'}>{siteOnline ? 'Live' : 'Offline'}</Tag>
        </div>
      </section>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
          Today's performance
        </div>
        <button type="button" className="pill-btn pill-ghost" onClick={exportStats}>
          <Download size={12} /> Export stats
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
        <StatCard label="Revenue"        value={fmtMoney(stats.total)} tone="accent"  Icon={IndianRupee} />
        <StatCard label="Total orders"   value={orders.length}         tone="default" Icon={ShoppingBag} />
        <StatCard label="Pending"        value={stats.pending}         tone="warning" Icon={Hourglass} />
        <StatCard label="Delivered"      value={stats.delivered}       tone="success" Icon={CheckCircle2} />
        <StatCard label="COD revenue"    value={fmtMoney(stats.cod)}   tone="default" Icon={Banknote} />
        <StatCard label="Prepaid rev."   value={fmtMoney(stats.prepaid)} tone="accent" Icon={CreditCard} />
      </div>

      <section className="admin-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Recent orders
            </span>
            <span className="live-dot" />
          </div>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
            No orders today — time to feast!
          </div>
        ) : (
          <div>
            {recent.map((o, i) => (
              <div key={o.token_number} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i === recent.length - 1 ? 'none' : '1px solid var(--color-admin-border-sub)',
              }}>
                <Tag tone="token">{tokenDisplay(o.token_number)}</Tag>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--color-ink)' }}>{o.customer_name}</div>
                  <div style={{
                    fontSize: 11, color: 'var(--color-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {o.items.map(it => `${it.qty}× ${it.name}`).join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{fmtMoney(o.total)}</span>
                  <Tag tone={o.payment_mode === 'cod' ? 'cod' : 'prepaid'}>
                    {o.payment_mode === 'cod' ? 'COD' : 'Prepaid'}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
