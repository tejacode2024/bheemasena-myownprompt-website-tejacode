import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { LoginScreen } from './components/LoginScreen'
import { ToastHost } from './components/ui/Toast'
import { useAdminStore } from './state/adminStore'
import { useUIStore, type AdminTab } from './state/uiStore'
import { useOrdersStore } from './state/ordersStore'
import { OverviewTab } from './tabs/Overview'
import { MenuItemsTab } from './tabs/MenuItems'
import { LunchOrdersTab } from './tabs/LunchOrders'
import { DinnerOrdersTab } from './tabs/DinnerOrders'
import { PastOrdersTab } from './tabs/PastOrders'
import { ShowOffTab } from './tabs/ShowOff'

const PARENT_POLL_MS = 15000

function App() {
  const authed = useAdminStore(s => s.authed)
  const secret = useAdminStore(s => s.secret)
  const loadConfig = useAdminStore(s => s.loadConfig)
  const setOrders = useOrdersStore(s => s.setOrders)
  const mergeOrders = useOrdersStore(s => s.mergeOrders)
  const orders = useOrdersStore(s => s.orders)
  const tab = useUIStore(s => s.tab)
  const setNewOrderInfo = useUIStore(s => s.setNewOrderInfo)
  const addToast = useUIStore(s => s.addToast)
  const prevCount = useRef(0)

  useEffect(() => { loadConfig() }, [loadConfig])

  useEffect(() => {
    if (!authed || !secret) return
    let mounted = true
    async function tick() {
      try {
        const fresh = await fetch('/api/orders', { headers: { 'x-admin-secret': secret } }).then(r => r.json()) as any[]
        if (!mounted || !Array.isArray(fresh)) return
        const cur = useOrdersStore.getState().orders
        if (cur.length === 0) setOrders(fresh)
        else mergeOrders(fresh)

        if (fresh.length > prevCount.current && prevCount.current !== 0) {
          const newOrders = [...fresh].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ).slice(0, fresh.length - prevCount.current)
          const latest = newOrders[0]
          if (latest) {
            setNewOrderInfo({ name: latest.customer_name, count: newOrders.length })
            addToast(`New order from ${latest.customer_name}`, 'new-order')
          }
        }
        prevCount.current = fresh.length
      } catch { /* ignore */ }
    }
    tick()
    const t = setInterval(tick, PARENT_POLL_MS)
    return () => { mounted = false; clearInterval(t) }
  }, [authed, secret, setOrders, mergeOrders, setNewOrderInfo, addToast])

  useEffect(() => {
    if (prevCount.current === 0 && orders.length > 0) prevCount.current = orders.length
  }, [orders.length])

  if (!authed) return <><LoginScreen /><ToastHost /></>

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main aria-label="Tab content">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderTab(tab)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastHost />
    </div>
  )
}

function renderTab(t: AdminTab) {
  switch (t) {
    case 'overview':    return <OverviewTab />
    case 'menu-items':  return <MenuItemsTab />
    case 'lunch':       return <LunchOrdersTab />
    case 'dinner':      return <DinnerOrdersTab />
    case 'past-orders': return <PastOrdersTab />
    case 'showoff':     return <ShowOffTab />
    default: return null
  }
}

export default App
