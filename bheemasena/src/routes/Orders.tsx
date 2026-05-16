import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { useAuthStore } from '../state/authStore'
import { useUIStore } from '../state/uiStore'
import { formatDayKey, formatDayLabel, formatTime, formatPrice } from '../lib/format'
import { Footer } from '../components/layout/Footer'

type ApiOrder = {
  id: number
  token_number: number
  customer_name: string
  customer_phone: string
  items: Array<{ name: string; qty: number }>
  payment_mode: string
  total: number
  pay_status: string
  deliver_status: string
  archived: boolean
  archived_at: string | null
  delivered_at: string | null
  created_at: string
}

// Single overall rating per order is stored as a row keyed by
// (order_token, item_id='__order__'). Per-item ratings would also be
// allowed by the schema, but a single rating per order is a much simpler
// UX and that's what this page exposes.
const ORDER_RATING_KEY = '__order__'

const LS_RATED_KEY = 'bheemasena:rated_orders'

function loadRatedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_RATED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch { return new Set() }
}

function saveRatedSet(s: Set<string>) {
  try { localStorage.setItem(LS_RATED_KEY, JSON.stringify(Array.from(s))) } catch { /* ignore */ }
}

export default function Orders() {
  const user = useAuthStore((s) => s.user)
  const toast = useUIStore((s) => s.toast)

  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [ratedSet, setRatedSet] = useState<Set<string>>(loadRatedSet)
  const [submittingFor, setSubmittingFor] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    if (!user?.phone) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/orders?phone=${encodeURIComponent(user.phone)}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiOrder[]) => {
        if (!mounted) return
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch(() => { if (mounted) setOrders([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [user?.phone])

  const groups = useMemo(() => {
    const map = new Map<string, ApiOrder[]>()
    for (const o of orders) {
      const ts = new Date(o.created_at).getTime()
      const k = formatDayKey(ts)
      const arr = map.get(k) ?? []
      arr.push(o)
      map.set(k, arr)
    }
    // newest day first
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1))
  }, [orders])

  const submitRating = async (order: ApiOrder, rating: number) => {
    if (!user?.phone) return
    if (submittingFor !== null) return
    setSubmittingFor(order.token_number)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_token: String(order.token_number),
          phone: user.phone,
          item_id: ORDER_RATING_KEY,
          rating,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        // 409 = already rated; treat as success silently
        if (res.status !== 409) {
          throw new Error(j?.error || `Submit failed (${res.status})`)
        }
      }
      const next = new Set(ratedSet)
      next.add(String(order.token_number))
      setRatedSet(next)
      saveRatedSet(next)
      toast('Thanks for rating!', 'success')
    } catch (e: any) {
      toast(e?.message || 'Could not submit rating', 'error')
    } finally {
      setSubmittingFor(null)
    }
  }

  return (
    <main>
      <section style={{
        padding: 'clamp(96px,10vw,140px) clamp(24px,6vw,96px) 80px',
        maxWidth: 880, margin: '0 auto',
      }}>
        <h1 style={{
          margin: '0 0 8px',
          fontSize: 'clamp(36px,5vw,64px)',
          fontWeight: 400, lineHeight: 1.0,
          color: 'var(--color-ink)',
        }}>
          Your Orders
        </h1>

        {loading && (
          <p style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 12, textTransform: 'none' }}>
            Loading…
          </p>
        )}

        {!loading && orders.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 12, textTransform: 'none' }}>
            No orders yet.
          </p>
        )}

        <div style={{ marginTop: 32 }}>
          {groups.map(([dayKey, list]) => (
            <div key={dayKey}>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'sticky',
                  top: 88,
                  zIndex: 1,
                  background: 'var(--color-paper)',
                  padding: '12px 0',
                  fontSize: 11,
                  letterSpacing: '0.25em',
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(14,14,12,0.06)',
                }}
              >
                {formatDayLabel(new Date(list[0].created_at).getTime())}
              </motion.div>

              <div style={{ marginTop: 16 }}>
                {list.map((o) => {
                  const ts = new Date(o.created_at).getTime()
                  const delivered = o.deliver_status === 'delivered'
                  const rated = ratedSet.has(String(o.token_number))

                  return (
                    <article key={o.id} className="card-paper" style={{ padding: 24, marginBottom: 12 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          fontSize: 11, letterSpacing: '0.25em',
                          color: 'var(--color-ink-soft)',
                        }}>#{String(o.token_number).padStart(3, '0')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="tag-pill" style={statusPillStyle(o)}>
                            {statusLabel(o)}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                            {formatTime(ts)}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 12,
                        fontSize: 12, color: 'var(--color-muted)',
                        textTransform: 'none', lineHeight: 1.6,
                      }}>
                        {o.items.map((it) => `${it.qty} × ${it.name}`).join(' · ')}
                      </div>

                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: 12,
                        marginTop: 16,
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          fontSize: 12, color: 'var(--color-muted)',
                          textTransform: 'none',
                        }}>
                          {o.payment_mode === 'cod' ? 'Cash on delivery' : 'Prepaid'}
                          {' · '}{o.pay_status}
                        </div>
                        <div style={{ fontSize: 16, color: 'var(--color-ink)' }}>
                          {formatPrice(o.total)}
                        </div>
                      </div>

                      {delivered && (
                        <div style={{
                          marginTop: 16, paddingTop: 16,
                          borderTop: '1px solid rgba(14,14,12,0.08)',
                          display: 'flex', alignItems: 'center', gap: 12,
                          flexWrap: 'wrap',
                        }}>
                          <div style={{
                            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                            color: rated ? 'var(--color-success)' : 'var(--color-muted)',
                          }}>
                            {rated ? 'Thanks for rating' : 'Rate this order'}
                          </div>
                          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
                                disabled={rated || submittingFor !== null}
                                onClick={() => submitRating(o, n)}
                                style={{
                                  background: 'transparent', border: 'none', padding: 4,
                                  cursor: rated ? 'default' : 'pointer',
                                  color: rated ? 'var(--color-accent)' : 'var(--color-muted)',
                                  opacity: submittingFor !== null && submittingFor !== o.token_number ? 0.4 : 1,
                                }}
                              >
                                <Star
                                  size={20}
                                  strokeWidth={1.5}
                                  fill={rated ? 'var(--color-accent)' : 'none'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function statusLabel(o: ApiOrder): string {
  if (o.deliver_status === 'delivered') return 'Delivered'
  if (o.archived) return 'Archived'
  return 'In progress'
}

function statusPillStyle(o: ApiOrder): React.CSSProperties {
  if (o.deliver_status === 'delivered') {
    return { borderColor: 'rgba(74,124,89,0.30)', color: 'var(--color-success)' }
  }
  if (o.archived) {
    return { borderColor: 'rgba(14,14,12,0.20)', color: 'var(--color-muted)' }
  }
  return { borderColor: 'rgba(139,107,61,0.30)', color: 'var(--color-accent)' }
}
