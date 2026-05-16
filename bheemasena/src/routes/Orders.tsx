import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useOrderStore } from '../state/orderStore'
import { formatDayKey, formatDayLabel, formatTime, formatPrice } from '../lib/format'
import { Footer } from '../components/layout/Footer'

export default function Orders() {
  const orders = useOrderStore((s) => s.orders)

  const groups = useMemo(() => {
    const map = new Map<string, typeof orders>()
    for (const o of orders) {
      const k = formatDayKey(o.createdAt)
      const arr = map.get(k) ?? []
      arr.push(o)
      map.set(k, arr)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
  }, [orders])

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
        {orders.length === 0 && (
          <p style={{
            fontSize: 14, color: 'var(--color-muted)',
            textTransform: 'none', marginTop: 12,
          }}>
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
                {formatDayLabel(list[0].createdAt)}
              </motion.div>

              <div style={{ marginTop: 16 }}>
                {list.map((o) => (
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
                      }}>{o.id}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="tag-pill" style={{
                          borderColor: 'rgba(139,107,61,0.30)',
                          color: 'var(--color-accent)',
                        }}>{o.status}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                          {formatTime(o.createdAt)}
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
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 'calc(100% - 100px)',
                      }}>
                        {[o.address.flat, o.address.street, o.address.city].filter(Boolean).join(', ')}
                      </div>
                      <div style={{ fontSize: 16, color: 'var(--color-ink)' }}>
                        {formatPrice(o.total)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
