import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Nav } from './components/layout/Nav'
import { CartDrawer } from './components/cart/CartDrawer'
import { OrderTimeline } from './components/cart/OrderTimeline'
import { ReserveModal } from './components/auth/ReserveModal'
import { Toast } from './components/ui/Toast'
import { AuthGate } from './components/auth/AuthGate'

const Landing   = lazy(() => import('./routes/Landing'))
const MenuPage  = lazy(() => import('./routes/MenuPage'))
const BlogList  = lazy(() => import('./routes/BlogList'))
const BlogPost  = lazy(() => import('./routes/BlogPost'))
const Login     = lazy(() => import('./routes/Login'))
const Orders    = lazy(() => import('./routes/Orders'))

function App() {
  return (
    <>
      <Nav />

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
