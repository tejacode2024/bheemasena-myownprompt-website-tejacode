import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '../../state/uiStore'

export function Toast() {
  const toasts = useUIStore((s) => s.toasts)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 96,
        right: 24,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: '#fff',
              color: 'var(--color-ink)',
              border: `1px solid ${
                t.tone === 'error'  ? 'rgba(181,82,74,0.30)'
              : t.tone === 'success' ? 'rgba(74,124,89,0.30)'
              : 'rgba(14,14,12,0.10)'
              }`,
              borderLeftWidth: 3,
              borderLeftColor:
                t.tone === 'error'   ? 'var(--color-danger)'
              : t.tone === 'success' ? 'var(--color-success)'
              : 'var(--color-accent)',
              borderRadius: 4,
              padding: '12px 16px',
              fontSize: 13,
              boxShadow: '0 8px 24px rgba(14,14,12,0.10)',
              pointerEvents: 'auto',
            }}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
