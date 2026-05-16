import { AnimatePresence, motion } from 'motion/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, User } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'
import { useCartStore } from '../../state/cartStore'
import { useAuthStore } from '../../state/authStore'

const LINKS = [
  { label: 'About',    to: '/#about'    },
  { label: 'Menu',     to: '/menu'      },
  { label: 'Orders',   to: '/orders'    },
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
  const navigate = useNavigate()
  const openCart  = useUIStore((s) => s.openCart)
  const cartCount = useCartStore((s) => s.count())
  const mode      = useAuthStore((s) => s.mode)
  const user      = useAuthStore((s) => s.user)

  const isAuthed = mode === 'authenticated' && !!user
  const initials = isAuthed
    ? user!.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U'
    : ''

  const handleCart = () => {
    onClose()
    // Guests / unauthenticated users → /login first; only signed-in
    // users can open the cart drawer.
    if (!isAuthed) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + '?cart=open')}`)
      return
    }
    setTimeout(openCart, 150)
  }
  const handleProfile = () => {
    onClose()
    if (!isAuthed) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)
    }
  }
  const handleReserve = () => {
    onClose()
    onReserve()
  }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
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

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            paddingBottom: 24, marginBottom: 24,
            borderBottom: '1px solid rgba(14,14,12,0.08)',
          }}>
            <button
              type="button"
              onClick={handleCart}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
              style={{
                position: 'relative',
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(14,14,12,0.04)', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--color-accent)', color: '#fff', fontSize: 9,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleProfile}
              aria-label={isAuthed ? `Signed in as ${user!.name}` : 'Sign in'}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: isAuthed ? 'var(--color-accent)' : 'rgba(14,14,12,0.04)',
                color: isAuthed ? '#fff' : 'var(--color-ink)',
                border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.05em',
              }}
            >
              {isAuthed ? initials : <User size={18} strokeWidth={1.5} />}
            </button>
            <button
              type="button"
              className="pill-btn pill-primary"
              style={{ marginLeft: 'auto', height: 44 }}
              onClick={handleReserve}
            >
              RESERVE →
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
