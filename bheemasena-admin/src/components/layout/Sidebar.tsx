import {
  LayoutDashboard, UtensilsCrossed, Sun, Moon, Clock, TrendingUp,
  ArrowUpRight, LogOut,
} from 'lucide-react'
import { useUIStore, type AdminTab } from '../../state/uiStore'
import { useAdminStore } from '../../state/adminStore'

type NavItem = { id: AdminTab; label: string; Icon: typeof LayoutDashboard }

const NAV: NavItem[] = [
  { id: 'overview',    label: 'Overview',      Icon: LayoutDashboard },
  { id: 'menu-items',  label: 'Menu Items',    Icon: UtensilsCrossed },
  { id: 'lunch',       label: 'Lunch Orders',  Icon: Sun },
  { id: 'dinner',      label: 'Dinner Orders', Icon: Moon },
  { id: 'past-orders', label: 'Past Orders',   Icon: Clock },
  { id: 'showoff',     label: 'Show Off',      Icon: TrendingUp },
]

export function Sidebar() {
  const tab = useUIStore(s => s.tab)
  const setTab = useUIStore(s => s.setTab)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const siteOnline = useAdminStore(s => s.siteOnline)
  const logout = useAdminStore(s => s.logout)

  return (
    <>
      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 35,
            background: 'rgba(14,14,12,0.45)',
            backdropFilter: 'blur(2px)',
          }}
          className="lg:hidden"
        />
      )}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(246,242,236,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, letterSpacing: '0.06em', color: 'var(--color-cream)' }}>
              Bheemasena
            </span>
            <span
              style={{
                fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase',
                background: 'var(--color-accent)', color: 'var(--color-cream)',
                padding: '2px 8px', borderRadius: 999,
              }}
            >
              Admin
            </span>
          </div>
          <div style={{
            marginTop: 4, fontSize: 10, fontStyle: 'italic',
            color: 'rgba(246,242,236,0.50)',
          }}>
            Royal Feast
          </div>
        </div>

        <nav style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {NAV.map((n, idx) => {
            const Icon = n.Icon
            const isActive = tab === n.id
            return (
              <div key={n.id}>
                {idx === 2 && (
                  <div
                    aria-hidden="true"
                    style={{ height: 1, background: 'rgba(246,242,236,0.08)', margin: '8px 0' }}
                  />
                )}
                <button
                  type="button"
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setTab(n.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{n.label}</span>
                </button>
              </div>
            )
          })}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid rgba(246,242,236,0.08)' }}>
          <button
            type="button"
            className="sidebar-item"
            onClick={() => setTab('overview')}
            style={{ marginBottom: 4 }}
            aria-label={`Site status: ${siteOnline ? 'online' : 'offline'}`}
          >
            <span className={`live-dot${siteOnline ? '' : ' offline'}`} />
            <span style={{ color: siteOnline ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {siteOnline ? 'Live' : 'Offline'}
            </span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="sidebar-item"
            style={{ color: 'rgba(246,242,236,0.50)', textDecoration: 'none' }}
          >
            <ArrowUpRight size={14} strokeWidth={1.5} />
            <span>Back to site</span>
          </a>

          <button type="button" className="sidebar-item" onClick={logout} aria-label="Log out">
            <LogOut size={14} strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
