import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'
import { buildWhatsAppReserveLink } from '../../lib/whatsapp'

export function ReserveModal() {
  const open = useUIStore((s) => s.reserveOpen)
  const close = useUIStore((s) => s.closeReserve)
  const toast = useUIStore((s) => s.toast)

  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ name: '', party: 2, date: today, time: '19:30', note: '' })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.date || !form.time || form.party < 1) {
      toast('Please fill all fields.', 'error')
      return
    }
    const url = buildWhatsAppReserveLink({
      name: form.name, party: form.party, date: form.date, time: form.time,
      note: form.note || undefined,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
    toast('Opening WhatsApp…', 'info')
    close()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(14,14,12,0.45)',
              zIndex: 80,
            }}
          />
          <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 81, padding: 24,
            pointerEvents: 'none',
          }}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reserve-title"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 'min(440px, 92vw)',
                background: '#fff',
                borderRadius: 8,
                padding: 32,
                pointerEvents: 'auto',
                position: 'relative',
              }}
            >
              <button
                type="button"
                aria-label="Close reserve modal"
                onClick={close}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>

              <h2 id="reserve-title" style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 400 }}>
                Reserve a Table
              </h2>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="field-label" htmlFor="rv-name">Name</label>
                  <input id="rv-name" className="field-input" value={form.name}
                         onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label" htmlFor="rv-party">Party size</label>
                  <input id="rv-party" type="number" min={1} max={20} className="field-input"
                         value={form.party} onChange={(e) => setForm({ ...form, party: Number(e.target.value) })} required />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="field-label" htmlFor="rv-date">Date</label>
                    <input id="rv-date" type="date" min={today} className="field-input"
                           value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="field-label" htmlFor="rv-time">Time</label>
                    <input id="rv-time" type="time" className="field-input"
                           value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="rv-note">Note (optional)</label>
                  <textarea id="rv-note" className="field-input" rows={3}
                            value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                <button type="submit" className="pill-btn pill-primary" style={{ width: '100%', marginTop: 8 }}>
                  OPEN IN WHATSAPP →
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
