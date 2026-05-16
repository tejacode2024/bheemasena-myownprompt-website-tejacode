import { useState } from 'react'
import { useUIStore } from '../../state/uiStore'
import { useCartStore } from '../../state/cartStore'
import { useOrderStore } from '../../state/orderStore'
import { formatPrice } from '../../lib/format'

export function CartStepPayment() {
  const setStep = useUIStore((s) => s.setStep)
  const toast   = useUIStore((s) => s.toast)
  const address = useUIStore((s) => s.addressDraft)
  const setLastOrderId = useUIStore((s) => s.setLastOrderId)

  const items    = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax      = useCartStore((s) => s.tax())
  const total    = useCartStore((s) => s.total())
  const clear    = useCartStore((s) => s.clear)

  const place = useOrderStore((s) => s.place)

  const [method] = useState<'COD'>('COD')

  const handlePlace = () => {
    if (!address) {
      toast('Address is missing.', 'error')
      setStep('address')
      return
    }
    if (items.length === 0) {
      toast('Cart is empty.', 'error')
      return
    }
    const order = place({
      items: items.map((i) => ({ ...i })),
      address,
      payment: method,
      subtotal, tax, total,
    })
    clear()
    setLastOrderId(order.id)
    setStep('confirmation')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.25em', color: 'var(--color-muted)',
          marginBottom: 12, textTransform: 'uppercase',
        }}>
          Payment Method
        </div>

        <PaymentOption
          selected
          title="Cash on Delivery"
          desc="Pay the rider when your order arrives."
        />

        <PaymentOption
          disabled
          title="Pay Online"
          desc="Online payments launching soon."
          badge="Coming soon"
        />

        <div style={{
          marginTop: 32, padding: 16,
          background: 'var(--color-cream)',
          borderRadius: 4,
        }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.25em', color: 'var(--color-muted)',
            marginBottom: 12, textTransform: 'uppercase',
          }}>
            Order Summary
          </div>
          <Row label={`Items (${items.reduce((s, i) => s + i.qty, 0)})`} value={formatPrice(subtotal)} />
          <Row label="Tax (5%)" value={formatPrice(tax)} />
          <Row label="Total" value={formatPrice(total)} bold />
        </div>
      </div>

      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(14,14,12,0.08)',
        display: 'flex', gap: 8,
      }}>
        <button type="button" className="pill-btn pill-ghost" onClick={() => setStep('address')}>BACK</button>
        <button type="button" className="pill-btn pill-primary" style={{ flex: 1 }} onClick={handlePlace}>
          PLACE ORDER →
        </button>
      </div>
    </div>
  )
}

function PaymentOption({ title, desc, selected, disabled, badge }: {
  title: string; desc: string; selected?: boolean; disabled?: boolean; badge?: string
}) {
  return (
    <div
      title={disabled ? 'Online payments launching soon.' : undefined}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        border: `1px solid ${selected ? 'var(--color-ink)' : 'rgba(14,14,12,0.12)'}`,
        borderRadius: 4,
        opacity: disabled ? 0.5 : 1,
        marginBottom: 8,
        background: selected ? 'var(--color-cream)' : '#fff',
      }}
    >
      <div style={{
        width: 16, height: 16, marginTop: 2,
        borderRadius: '50%',
        border: `1px solid ${selected ? 'var(--color-ink)' : 'rgba(14,14,12,0.30)'}`,
        background: selected ? 'var(--color-ink)' : '#fff',
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13, letterSpacing: '0.06em',
          color: 'var(--color-ink)', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {title}
          {badge && (
            <span className="tag-pill">{badge}</span>
          )}
        </div>
        <div style={{
          marginTop: 4, fontSize: 12, color: 'var(--color-muted)',
          textTransform: 'none',
        }}>
          {desc}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: bold ? 16 : 12,
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
