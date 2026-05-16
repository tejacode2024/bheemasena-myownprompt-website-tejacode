import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { User } from 'lucide-react'
import { useAuthStore } from '../../state/authStore'
import { useUIStore } from '../../state/uiStore'

export function ProfileMenu() {
  const user    = useAuthStore((s) => s.user)
  const mode    = useAuthStore((s) => s.mode)
  const logout  = useAuthStore((s) => s.logout)
  const toast   = useUIStore((s) => s.toast)
  const navigate = useNavigate()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isAuthed = mode === 'authed' && !!user

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        aria-label={isAuthed ? `Profile menu for ${user!.name}` : 'Profile menu'}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: isAuthed ? 'var(--color-accent)' : 'transparent',
          color: isAuthed ? '#fff' : 'var(--color-ink)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          fontSize: 12, letterSpacing: '0.05em',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => { if (!isAuthed) e.currentTarget.style.background = 'rgba(14,14,12,0.05)' }}
        onMouseLeave={(e) => { if (!isAuthed) e.currentTarget.style.background = 'transparent' }}
      >
        {isAuthed ? user!.initials : <User size={18} strokeWidth={1.5} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 220,
              background: '#fff',
              border: '1px solid rgba(14,14,12,0.08)',
              borderRadius: 8,
              boxShadow: '0 12px 40px rgba(14,14,12,0.12)',
              padding: 8,
              zIndex: 50,
            }}
            role="menu"
          >
            {isAuthed ? (
              <>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ink)' }}>{user!.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>{user!.email}</div>
                </div>
                <div style={{ height: 1, background: 'rgba(14,14,12,0.08)', margin: '4px 0' }} />
                <MenuItem onClick={() => { setOpen(false); navigate('/orders') }}>My Orders</MenuItem>
                <MenuItem onClick={() => { setOpen(false); toast('Address book — coming soon', 'info') }}>My Addresses</MenuItem>
                <div style={{ height: 1, background: 'rgba(14,14,12,0.08)', margin: '4px 0' }} />
                <MenuItem onClick={() => { setOpen(false); logout(); navigate('/') }}>Log out</MenuItem>
              </>
            ) : (
              <>
                <div style={{
                  padding: '8px 12px',
                  fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                }}>{mode === 'guest' ? 'Guest' : 'Sign in'}</div>
                <MenuItem onClick={() => {
                  setOpen(false)
                  navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)
                }}>Log in</MenuItem>
                <MenuItem onClick={() => {
                  setOpen(false)
                  navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)
                }}>Sign up</MenuItem>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        fontSize: 11,
        letterSpacing: '0.04em',
        color: 'var(--color-ink)',
        cursor: 'pointer',
        borderRadius: 4,
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-cream)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
