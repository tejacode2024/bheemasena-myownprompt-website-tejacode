import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu as MenuIcon } from 'lucide-react'
import { ProfileMenu } from './ProfileMenu'
import { MobileNav } from './MobileNav'
import { useUIStore } from '../../state/uiStore'
import { useCartStore } from '../../state/cartStore'
import { useAuthStore } from '../../state/authStore'

const LINKS = [
  { label: 'About',    to: '/#about'    },
  { label: 'Menu',     to: '/menu'      },
  { label: 'Orders',   to: '/orders'    },
  { label: 'Team',     to: '/#team'     },
  { label: 'Blog',     to: '/blog'      },
  { label: 'Contacts', to: '/#contacts' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const lang        = useUIStore((s) => s.lang)
  const toggleLang  = useUIStore((s) => s.toggleLang)
  const openCart    = useUIStore((s) => s.openCart)
  const openReserve = useUIStore((s) => s.openReserve)
  const cartCount   = useCartStore((s) => s.count())
  const authMode    = useAuthStore((s) => s.mode)
  const user        = useAuthStore((s) => s.user)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCartClick = () => {
    const isAuthed = authMode === 'authenticated' && !!user
    if (!isAuthed && authMode !== 'guest') {
      navigate(`/login?next=${encodeURIComponent(location.pathname + '?cart=open')}`)
      return
    }
    openCart()
  }

  const isActive = (to: string) => {
    if (to.includes('#')) return false
    return location.pathname === to
  }

  return (
    <>
      <header role="banner">
        <div className={`navbar-pill ${scrolled ? 'scrolled' : ''}`}>
          <Link
            to="/"
            aria-label="Bheemasena home"
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '0 20px', height: '100%',
              borderRight: '1px solid rgba(14,14,12,0.08)',
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 16, letterSpacing: '0.06em', color: 'var(--color-ink)' }}>Bheemasena</span>
            <span style={{
              fontSize: 11, fontStyle: 'italic',
              color: 'var(--color-muted)',
              letterSpacing: '0.18em', marginLeft: 14, marginTop: 2,
            }}>Royal Feast</span>
          </Link>

          <nav
            aria-label="Primary"
            style={{ display: 'flex', alignItems: 'center', padding: '0 8px', height: '100%' }}
            className="hidden md:flex"
          >
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  position: 'relative',
                  padding: '0 14px', height: '100%',
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase',
                  color: isActive(l.to) ? 'var(--color-ink)' : 'var(--color-muted)',
                  transition: 'color 0.25s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive(l.to) ? 'var(--color-ink)' : 'var(--color-muted)')}
              >
                {l.label}
                {isActive(l.to) && (
                  <span style={{
                    position: 'absolute',
                    bottom: 14, left: 14, right: 14,
                    height: 1, background: 'var(--color-accent)',
                  }} />
                )}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleLang}
            className="hidden md:inline-flex"
            style={{
              padding: '0 12px', height: '100%',
              fontSize: 10, letterSpacing: '0.2em',
              color: 'var(--color-muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            aria-label={`Language: ${lang.toUpperCase()}. Toggle.`}
          >
            {lang === 'en' ? 'EN | FR' : 'FR | EN'}
          </button>

          <button
            type="button"
            onClick={handleCartClick}
            aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            style={{
              position: 'relative',
              width: 40, height: 40,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease',
              marginLeft: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(14,14,12,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -2, right: -2,
                width: 16, height: 16,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                color: '#fff',
                fontSize: 9,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>

          <div style={{ marginLeft: 4 }}>
            <ProfileMenu />
          </div>

          <button
            type="button"
            onClick={openReserve}
            className="pill-btn pill-primary"
            style={{ height: 40, marginLeft: 6, marginRight: 6 }}
          >
            RESERVE →
          </button>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginLeft: 4, marginRight: 4,
            }}
          >
            <MenuIcon size={20} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onReserve={openReserve}
      />
    </>
  )
}
