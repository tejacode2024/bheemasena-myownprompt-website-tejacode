import { AnimatePresence, motion } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

const LINKS = [
  { label: 'About',    to: '/#about'    },
  { label: 'Menu',     to: '/menu'      },
  { label: 'Orders',   to: '/orders'    },
  { label: 'Team',     to: '/#team'     },
  { label: 'Blog',     to: '/blog'      },
  { label: 'Contacts', to: '/#contacts' },
]

type Props = {
  open: boolean
  onClose: () => void
  onReserve: () => void
}

export function MobileNav({ open, onClose, onReserve }: Props) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'var(--color-paper)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 28px',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 56 }}>
            <div>
              <div style={{ fontSize: 16, letterSpacing: '0.06em' }}>Bheemasena</div>
              <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--color-muted)', letterSpacing: '0.18em' }}>
                Royal Feast
              </div>
            </div>
            <button
              aria-label="Close menu"
              onClick={onClose}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={onClose}
                style={{
                  fontSize: 24,
                  color: location.pathname === l.to.split('#')[0] ? 'var(--color-ink)' : 'var(--color-ink-soft)',
                  letterSpacing: '0.02em',
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: 32 }}>
            <button
              type="button"
              className="pill-btn pill-primary"
              style={{ width: '100%' }}
              onClick={() => { onClose(); onReserve() }}
            >
              RESERVE →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
