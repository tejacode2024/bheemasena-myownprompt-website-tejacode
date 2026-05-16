import { useEffect, useMemo, useState } from 'react'
import { Clock, ShoppingBag, IndianRupee, CheckCircle2 } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { OrderCard } from '../components/orders/OrderCard'
import { api, type RawOrder } from '../lib/api'
import { useAdminStore } from '../state/adminStore'
import { fmtDateLabel, fmtDateKey, fmtMoney } from '../lib/format'

export function PastOrdersTab() {
  const secret = useAdminStore(s => s.secret)
  const [orders, setOrders] = useState<RawOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>(fmtDateKey(new Date()))

  useEffect(() => {
    let mounted = true
    api.fetchArchivedOrders(secret)
      .then(o => { if (mounted) setOrders(o) })
      .catch(() => { if (mounted) setOrders([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [secret])

  const days = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - i)
      return d
    })
  }, [])

  const dayOrders = useMemo(
    () => orders.filter(o => fmtDateKey(o.created_at) === selectedDay),
    [orders, selectedDay],
  )

  const stats = {
    orders: dayOrders.length,
    revenue: dayOrders.reduce((s, o) => s + o.total, 0),
    delivered: dayOrders.filter(o => o.deliver_status === 'delivered').length,
  }

  return (
    <div style={{ padding: 'clamp(16px,3vw,24px)', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }} className="scrollbar-hide">
        {days.map(d => {
          const key = fmtDateKey(d)
          const active = key === selectedDay
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(key)}
              className={`pill-btn ${active ? 'pill-accent' : 'pill-ghost'}`}
              style={{ flexShrink: 0 }}
            >
              {fmtDateLabel(d)}
            </button>
          )
        })}
      </div>

      {dayOrders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
          <StatCard label="Orders" value={stats.orders} compact Icon={ShoppingBag} />
          <StatCard label="Revenue" value={fmtMoney(stats.revenue)} tone="accent" compact Icon={IndianRupee} />
          <StatCard label="Delivered" value={stats.delivered} tone="success" compact Icon={CheckCircle2} />
        </div>
      )}

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
          Loading archived orders…
        </div>
      ) : dayOrders.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted)' }}>
          <Clock size={40} strokeWidth={1.5} style={{ opacity: 0.2 }} />
          <div style={{ marginTop: 12, fontSize: 13 }}>No archived orders for this day.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayOrders.map(o => <OrderCard key={o.token_number} order={o} readOnly />)}
        </div>
      )}
    </div>
  )
}
