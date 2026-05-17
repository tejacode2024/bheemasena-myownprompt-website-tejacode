import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { Nav } from './components/layout/Nav'
import { CartDrawer } from './components/cart/CartDrawer'
import { OrderTimeline } from './components/cart/OrderTimeline'
import { ReserveModal } from './components/auth/ReserveModal'
import { Toast } from './components/ui/Toast'
import { AuthGate } from './components/auth/AuthGate'
import { useConfigStore } from './state/configStore'

const Landing   = lazy(() => import('./routes/Landing'))
const MenuPage  = lazy(() => import('./routes/MenuPage'))
const BlogList  = lazy(() => import('./routes/BlogList'))
const BlogPost  = lazy(() => import('./routes/BlogPost'))
const Login     = lazy(() => import('./routes/Login'))
const Orders    = lazy(() => import('./routes/Orders'))

// Resets scroll to the top whenever the route changes. Without this,
// navigating from a scrolled-down landing page to /blog or /orders
// inherits the previous scroll position — and on shorter pages that
// position often lands inside the footer.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Only reset for path changes, not hash changes (in-page anchors).
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

// How often to re-pull the admin config in the background. Short enough
// that a site_online / closed_message change shows up on open user
// sessions within ~POLL_MS of the admin clicking Save; light enough
// (single JSON GET, primitives compared by reference so no re-render
// when nothing actually changed) that hammering it isn't a concern.
const CONFIG_POLL_MS = 2500

function App() {
  // Pull the live site_online / closed_message values from the admin
  // config on mount, then poll every CONFIG_POLL_MS so admin changes
  // propagate to open user sessions without a page reload. Also refetch
  // immediately whenever the tab becomes visible again so users who
  // were idle/in another tab see the latest state right away.
  const loadConfig = useConfigStore((s) => s.load)
  useEffect(() => {
    loadConfig()
    const interval = setInterval(() => {
      // Skip background polling while the tab is hidden — pointless
      // network use, and visibilitychange will refetch when it returns.
      if (!document.hidden) loadConfig()
    }, CONFIG_POLL_MS)
    const onVisible = () => { if (!document.hidden) loadConfig() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [loadConfig])

  return (
    <>
      <Nav />
      <ScrollToTop />

      <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/menu"         element={<MenuPage />} />
          <Route path="/blog"         element={<BlogList />} />
          <Route path="/blog/:slug"   element={<BlogPost />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/orders"       element={<AuthGate><Orders /></AuthGate>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <CartDrawer />
      <OrderTimeline />
      <ReserveModal />
      <Toast />
    </>
  )
}

export default App
