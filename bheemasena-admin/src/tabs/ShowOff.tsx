import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { TrendingUp, MessageCircle, Download, Trash2 } from 'lucide-react'
import { useOrdersStore } from '../state/ordersStore'
import { useUIStore } from '../state/uiStore'
import { loadExcelJS, triggerDownload } from '../lib/excel'

export function ShowOffTab() {
  const orders = useOrdersStore(s => s.orders)
  const toast = useUIStore(s => s.addToast)
  const [hasExported, setHasExported] = useState(false)
  const [cleared, setCleared] = useState(false)

  const tally = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) {
      for (const it of o.items ?? []) {
        map.set(it.name, (map.get(it.name) ?? 0) + (it.qty || 1))
      }
    }
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
  }, [orders])

  const total = tally.reduce((s, t) => s + t.qty, 0)
  const max = tally[0]?.qty ?? 0
  const display = cleared ? [] : tally

  function shareWhatsApp() {
    const lines = display.map(t => `${t.name} — ${t.qty}`).join('\n')
    const msg =
      `🏛 *BHEEMASENA — Today's Bestsellers*\n\n` +
      `${lines}\n\nTotal items: ${total}`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function exportXLSX() {
    try {
      const ExcelJS = await loadExcelJS()
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Bestsellers')
      ws.columns = [{ width: 6 }, { width: 36 }, { width: 8 }]
      ws.addRow(['#', 'Item', 'Qty']).font = { bold: true }
      display.forEach((t, i) => ws.addRow([i + 1, t.name, t.qty]))
      const buf = await wb.xlsx.writeBuffer()
      triggerDownload(buf, `bheemasena-showoff-${new Date().toISOString().slice(0,10)}.xlsx`)
      setHasExported(true)
      toast('Bestsellers exported', 'success')
    } catch { toast('Export failed', 'error') }
  }

  function clear() {
    if (!hasExported || orders.length !== 0) return
    setCleared(true)
    toast('Show Off cleared (UI only)', 'success')
  }

  return (
    <div style={{ padding: 'clamp(16px,3vw,24px)', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className="pill-btn pill-success" onClick={shareWhatsApp} disabled={display.length === 0}>
          <MessageCircle size={12} /> Share on WhatsApp
        </button>
        <button type="button" className="pill-btn pill-accent" onClick={exportXLSX} disabled={display.length === 0}>
          <Download size={12} /> Export
        </button>
        <button type="button" className="pill-btn pill-danger" onClick={clear}
          disabled={!hasExported || orders.length !== 0}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <section style={{
        padding: 20, marginBottom: 16,
        background: 'var(--color-accent)', color: 'var(--color-cream)',
        borderRadius: 4, boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <TrendingUp size={16} strokeWidth={1.5} />
          <span style={{ fontSize: 14 }}>Today's performance</span>
        </div>
        <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>{display.reduce((s, t) => s + t.qty, 0)}</div>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.85 }}>
          Total items served today
        </div>
        {display[0] && (
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'rgba(255,255,255,0.20)', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.8 }}>Top seller</div>
              <div style={{ fontSize: 14 }}>{display[0].name}</div>
            </div>
            <div style={{ fontSize: 22 }}>{display[0].qty}</div>
          </div>
        )}
      </section>

      <section className="admin-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 12 }}>
          Bestsellers
        </div>

        {display.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <TrendingUp size={40} strokeWidth={1.5} style={{ opacity: 0.25 }} />
            <div style={{ marginTop: 12, color: 'var(--color-muted)', fontSize: 13 }}>
              No orders yet — start the feast!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {display.map((t, i) => (
              <div key={t.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ minWidth: 24, fontSize: 12, color: 'var(--color-muted)', textAlign: 'right' }}>{i + 1}.</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--color-ink)' }}>{t.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-accent)' }}>{t.qty}</span>
                </div>
                <div className="progress-bar" style={{ marginLeft: 36 }}>
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.qty / max) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
