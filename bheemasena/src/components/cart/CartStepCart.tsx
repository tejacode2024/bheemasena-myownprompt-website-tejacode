import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../state/cartStore'
import { useAuthStore } from '../../state/authStore'
import { useUIStore } from '../../state/uiStore'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'
import { formatPrice } from '../../lib/format'

export function CartStepCart() {
  const items    = useCartStore((s) => s.items)
  const inc      = useCartStore((s) => s.inc)
  const dec      = useCartStore((s) => s.dec)
  const remove   = useCartStore((s) => s.remove)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax      = useCartStore((s) => s.tax())
  const total    = useCartStore((s) => s.total())

  const setStep   = useUIStore((s) => s.setStep)
  const closeCart = useUIStore((s) => s.closeCart)
  const mode      = useAuthStore((s) => s.mode)
  const user      = useAuthStore((s) => s.user)

  const navigate = useNavigate()
  const location = useLocation()

  const handleContinue = () => {
    const isAuthed = mode === 'authed' && !!user
    if (!isAuthed) {
      closeCart()
      navigate(`/login?next=${encodeURIComponent(location.pathname + '?cart=open')}`)
      return
    }
    setStep('address')
  }

  if (items.length === 0) {
    return (
      <div style={{
        padding: '64px 24px',
        textAlign: 'center',
        color: 'var(--color-muted)',
      }}>
        <p style={{ fontSize: 16, marginBottom: 24 }}>Your cart is empty.</p>
        <button type="button" className="pill-btn pill-secondary" onClick={closeCart}>
          BROWSE MENU →
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '64px 1fr auto auto',
              gap: 12,
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: '1px solid rgba(14,14,12,0.06)',
            }}
          >
            <div style={{ width: 64, height: 64 }}>
              <ImagePlaceholder aspect="1/1" label="" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 14, color: 'var(--color-ink)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                {formatPrice(it.price)}
              </div>
            </div>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--color-cream)',
                padding: '4px 6px',
                borderRadius: 999,
              }}
            >
              <button
                type="button"
                aria-label={`Decrease ${it.name}`}
                onClick={() => dec(it.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 22, height: 22 }}
              >
                <Minus size={12} />
              </button>
              <span style={{ fontSize: 12, minWidth: 14, textAlign: 'center' }}>{it.qty}</span>
              <button
                type="button"
                aria-label={`Increase ${it.name}`}
                onClick={() => inc(it.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 22, height: 22 }}
              >
                <Plus size={12} />
              </button>
            </div>
            <button
              type="button"
              aria-label={`Remove ${it.name}`}
              onClick={() => remove(it.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-muted)', padding: 6,
              }}
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--color-muted)' }}>
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          <Row label="Tax (5%)" value={formatPrice(tax)} />
          <Row label="Total" value={formatPrice(total)} bold />
        </div>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(14,14,12,0.08)' }}>
        <button
          type="button"
          className="pill-btn pill-primary"
          style={{ width: '100%' }}
          disabled={items.length === 0}
          onClick={handleContinue}
        >
          CONTINUE →
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: bold ? 18 : 12,
      color: bold ? 'var(--color-ink)' : 'var(--color-muted)',
      borderTop: bold ? '1px solid rgba(14,14,12,0.10)' : 'none',
      marginTop: bold ? 8 : 0,
      paddingTop: bold ? 12 : 6,
    }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
