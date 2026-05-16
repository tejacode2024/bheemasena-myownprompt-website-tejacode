import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '../../state/uiStore'
import { useCartStore } from '../../state/cartStore'
import { useAuthStore } from '../../state/authStore'
import { useOrderStore } from '../../state/orderStore'
import { addressDisplay } from '../../state/orderStore'
import { formatPrice } from '../../lib/format'

const DURATION = 30 // seconds
const CIRC = 251   // 2 * π * r where r = 40

export function OrderTimeline() {
  const open      = useUIStore((s) => s.timelineOpen)
  const draft     = useUIStore((s) => s.orderDraft)
  const close     = useUIStore((s) => s.closeTimeline)
  const openCart  = useUIStore((s) => s.openCart)
  const setStep   = useUIStore((s) => s.setStep)
  const toast     = useUIStore((s) => s.toast)
  const setLast   = useUIStore((s) => s.setLastOrderId)

  const items    = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax      = useCartStore((s) => s.tax())
  const total    = useCartStore((s) => s.total())
  const clear    = useCartStore((s) => s.clear)

  const place = useOrderStore((s) => s.place)
  const user  = useAuthStore((s) => s.user)
  const mode  = useAuthStore((s) => s.mode)

  const [remaining, setRemaining] = useState(DURATION)
  const [busy, setBusy] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Countdown ──
  useEffect(() => {
    if (!open) return
    setRemaining(DURATION)
    tickRef.current = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1))
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (remaining === 0) {
      handleCancel('Order cancelled — time expired.')
    }
  }, [remaining, open]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Escape closes (treats as cancel) ──
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCancel(message = 'Order cancelled.') {
    close()
    setStep('cart')
    openCart()
    toast(message, 'info')
  }

  async function handleConfirm() {
    if (!draft || items.length === 0) {
      handleCancel('Order cancelled.')
      return
    }
    setBusy(true)
    try {
      const order = await place({
        items: items.map((i) => ({ ...i })),
        address: draft.address,
        payment: draft.payment,
        subtotal, tax, total,
      })
      clear()
      setLast(order.id)
      close()
      setStep('confirmation')
      openCart()
    } catch {
      toast('Could not place order. Try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (typeof document === 'undefined') return null

  const offset = (CIRC * (DURATION - remaining)) / DURATION

  return createPortal(
    <AnimatePresence>
      {open && draft && (
        <motion.div
          key="timeline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm your order"
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'var(--color-ink)',
            color: 'var(--color-cream)',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: 480, margin: '0 auto',
              minHeight: '100svh',
              display: 'flex', flexDirection: 'column',
              padding: 'clamp(32px, 6vw, 64px) 24px',
              gap: 32,
            }}
          >
            {/* ── Countdown circle ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="rgba(246,242,236,0.15)" strokeWidth="3" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="var(--color-accent)" strokeWidth="3"
                    strokeDasharray={CIRC}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: 'var(--color-cream)', fontWeight: 400,
                }}>
                  {remaining}
                </div>
              </div>
              <div style={{
                marginTop: 12,
                fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(246,242,236,0.55)',
              }}>
                seconds to confirm
              </div>
            </div>

            {/* ── Order preview ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Block label="Your order">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {items.map((it) => (
                    <div key={it.id} style={{ fontSize: 13, color: 'var(--color-cream)', lineHeight: 1.6 }}>
                      {it.qty} × {it.name}
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 10,
                  fontSize: 14, letterSpacing: '0.04em',
                  color: 'var(--color-accent)',
                }}>
                  Total: {formatPrice(total)}
                </div>
              </Block>

              <Block label="Delivery to">
                <div style={{ fontSize: 13, color: 'var(--color-cream)', lineHeight: 1.6 }}>
                  {draft.address.fullName} · {draft.address.phone}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-cream)', lineHeight: 1.6, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                  {addressDisplay(draft.address)}
                </div>
                <div style={{
                  marginTop: 6,
                  fontSize: 11, letterSpacing: '0.06em',
                  color: 'rgba(246,242,236,0.55)',
                }}>
                  Payment: {draft.payment === 'COD' ? 'Cash on Delivery' : 'Pay Online'}
                </div>
              </Block>

              <Block label="Placed by" last>
                <div style={{ fontSize: 13, color: 'var(--color-cream)', lineHeight: 1.6 }}>
                  {mode === 'authenticated' && user
                    ? `${user.name} · ${user.email}`
                    : 'Guest'}
                </div>
              </Block>
            </div>

            {/* ── Buttons ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirm}
                style={{
                  width: '100%', height: 52,
                  background: 'var(--color-cream)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-cream)',
                  borderRadius: 999,
                  fontFamily: 'inherit',
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                  transition: 'background 0.25s ease, color 0.25s ease',
                }}
              >
                {busy ? 'PLACING…' : 'CONFIRM ORDER →'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleCancel('Order cancelled.')}
                style={{
                  width: '100%', height: 48,
                  background: 'transparent',
                  color: 'var(--color-cream)',
                  border: '1px solid rgba(246,242,236,0.45)',
                  borderRadius: 999,
                  fontFamily: 'inherit',
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                CANCEL →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function Block({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      padding: '20px 0',
      borderBottom: last ? 'none' : '1px solid rgba(246,242,236,0.08)',
    }}>
      <div style={{
        fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'rgba(246,242,236,0.45)', marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}
