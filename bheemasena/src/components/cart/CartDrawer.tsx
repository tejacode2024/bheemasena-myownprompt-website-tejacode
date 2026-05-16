import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'
import { CartStepCart } from './CartStepCart'
import { CartStepConfirmation } from './CartStepConfirmation'

const TITLES: Record<string, string> = {
  cart: 'Your Cart',
  confirmation: 'Order Placed',
}

export function CartDrawer() {
  const open      = useUIStore((s) => s.cartOpen)
  const step      = useUIStore((s) => s.cartStep)
  const closeCart = useUIStore((s) => s.closeCart)
  const panelRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeCart])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const prevActive = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => prevActive?.focus()
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(14,14,12,0.40)',
              zIndex: 70,
            }}
          />
          <motion.div
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={TITLES[step] ?? 'Cart'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0,
              height: '100svh', width: 'min(440px, 100vw)',
              zIndex: 71,
              background: 'var(--color-paper)',
              boxShadow: '-12px 0 48px rgba(14,14,12,0.18)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              height: 64,
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(14,14,12,0.08)',
              flexShrink: 0,
            }}>
              <h2 style={{
                margin: 0, fontSize: 18, fontWeight: 400,
                color: 'var(--color-ink)',
              }}>
                {TITLES[step] ?? 'Cart'}
              </h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeCart}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%' }}
                >
                  {step === 'confirmation' ? <CartStepConfirmation /> : <CartStepCart />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
