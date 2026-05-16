import { useEffect, useRef, useState } from 'react'
import { Phone, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Tag } from '../ui/Tag'
import { fmtDT, fmtMoney, tokenDisplay } from '../../lib/format'
import type { RawOrder } from '../../lib/api'

type Props = {
  order: RawOrder
  isNew?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onDeliver?: () => void
  readOnly?: boolean
}

export function OrderCard({ order, isNew, onEdit, onDelete, onDeliver, readOnly }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const delivered = order.deliver_status === 'delivered'

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const isPrepaid = order.payment_mode && order.payment_mode !== 'cod'
  const payStatus = order.pay_status

  return (
    <article className={`order-card ${delivered ? 'delivered' : ''}`}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, padding: '14px 16px 10px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isNew && <Tag tone="new-badge">New</Tag>}
          {order.archived && <Tag tone="archived">Archived</Tag>}
          <Tag tone="token">{tokenDisplay(order.token_number)}</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Tag tone={isPrepaid ? 'prepaid' : 'cod'}>
            {isPrepaid ? 'Prepaid' : 'COD'}
          </Tag>
          {payStatus === 'paid' && <Tag tone="paid">Paid</Tag>}
          {payStatus === 'unpaid' && <Tag tone="unpaid">Unpaid</Tag>}
          {payStatus === 'pending' && order.pending_amount != null && (
            <Tag tone="pending">Pending {fmtMoney(order.pending_amount)}</Tag>
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px 10px' }}>
        <div style={{ fontSize: 16, color: 'var(--color-ink)', marginBottom: 4 }}>
          {order.customer_name}
        </div>
        <a
          href={`tel:${order.customer_phone}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--color-muted)', fontSize: 12, textDecoration: 'none',
          }}
        >
          <Phone size={12} strokeWidth={1.5} />
          {order.customer_phone}
        </a>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 12,
          color: 'var(--color-muted)', fontSize: 11,
        }}>
          <Clock size={11} strokeWidth={1.5} />
          {fmtDT(order.created_at)}
        </div>
      </div>

      <div style={{
        margin: '0 16px 12px', padding: '10px 14px',
        background: 'var(--color-cream)', borderRadius: 4,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {(order.items ?? []).map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 28, height: 22, padding: '0 6px',
              background: 'var(--color-accent)', color: 'var(--color-cream)',
              borderRadius: 999, fontSize: 12, letterSpacing: '0.02em',
            }}>
              ×{it.qty}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>{it.name}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px 16px', gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 20, color: 'var(--color-ink)' }}>{fmtMoney(order.total)}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }} ref={menuRef}>
          <a
            href={`tel:${order.customer_phone}`}
            aria-label="Call customer"
            style={{
              width: 46, height: 46, borderRadius: '50%',
              border: '1px solid rgba(74,124,89,0.4)',
              color: 'var(--color-success)', background: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <Phone size={16} strokeWidth={1.5} />
          </a>

          {!readOnly && (
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="More actions"
              style={{
                width: 46, height: 46, borderRadius: '50%',
                border: '1px solid var(--color-admin-border)', background: 'transparent',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          )}

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute', bottom: 54, right: 0,
                background: 'var(--color-admin-surface)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 6, boxShadow: 'var(--shadow-hover)',
                minWidth: 160, padding: 4, zIndex: 5,
              }}
            >
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit?.() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, color: 'var(--color-ink)', textAlign: 'left',
                }}
              >
                <Pencil size={14} strokeWidth={1.5} /> Edit order
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete?.() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, color: 'var(--color-danger)', textAlign: 'left',
                }}
              >
                <Trash2 size={14} strokeWidth={1.5} /> Delete
              </button>
            </div>
          )}

          {!readOnly && (
            <button
              type="button"
              onClick={() => !delivered && onDeliver?.()}
              disabled={delivered}
              className={`pill-btn ${delivered ? 'pill-ghost' : 'pill-success'}`}
              style={{ height: 46, marginLeft: 4 }}
            >
              {delivered ? 'Delivered' : 'Deliver →'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
