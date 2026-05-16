import { Menu as MenuIcon } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'
import { useAdminStore } from '../../state/adminStore'

const TAB_LABEL: Record<string, string> = {
  'overview':    'Overview',
  'menu-items':  'Menu Items',
  'lunch':       'Lunch Orders',
  'dinner':      'Dinner Orders',
  'past-orders': 'Past Orders',
  'showoff':     'Show Off',
}

export function Topbar() {
  const tab = useUIStore(s => s.tab)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const siteOnline = useAdminStore(s => s.siteOnline)
  const statusMsg = useAdminStore(s => s.statusMsg)
  const logout = useAdminStore(s => s.logout)

  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Open navigation"
          className="lg:hidden"
          style={{
            width: 36, height: 36, border: '1px solid var(--color-admin-border)',
            background: 'transparent', borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <MenuIcon size={18} />
        </button>
        <h1 style={{ margin: 0, fontSize: 15, letterSpacing: '0.06em', color: 'var(--color-ink)', fontWeight: 400 }}>
          {TAB_LABEL[tab] ?? 'Dashboard'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`live-dot${siteOnline ? '' : ' offline'}`} />
          <span style={{
            fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
            color: siteOnline ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {siteOnline ? 'Live' : 'Offline'}
          </span>
        </div>

        {statusMsg && (
          <span style={{
            fontSize: 11, letterSpacing: '0.1em',
            color: statusMsg === 'Saved' ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {statusMsg === 'Saved' ? 'Saved ✓' : 'Failed ✗'}
          </span>
        )}

        <button
          type="button"
          onClick={() => { if (confirm('Log out of admin?')) logout() }}
          aria-label="Profile / logout"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-accent)', color: 'var(--color-cream)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          A
        </button>
      </div>
    </header>
  )
}
