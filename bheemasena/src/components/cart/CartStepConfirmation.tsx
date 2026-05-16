import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'

export function CartStepConfirmation() {
  const closeCart    = useUIStore((s) => s.closeCart)
  const setStep      = useUIStore((s) => s.setStep)
  const lastOrderId  = useUIStore((s) => s.lastOrderId)
  const navigate     = useNavigate()

  const close = () => {
    closeCart()
    setStep('cart')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center',
      padding: '64px 32px',
      height: '100%',
      justifyContent: 'center',
    }}>
      <CheckCircle2 size={56} strokeWidth={1.4} color="var(--color-success)" />
      <h3 style={{
        margin: '24px 0 8px',
        fontSize: 28, fontWeight: 400,
        color: 'var(--color-ink)',
      }}>
        Order Placed
      </h3>
      <p style={{
        fontSize: 13, color: 'var(--color-muted)',
        lineHeight: 1.6, textTransform: 'none',
        maxWidth: 320,
      }}>
        Your order <strong style={{ color: 'var(--color-ink)' }}>{lastOrderId}</strong> has been received.
        <br />Estimated delivery: 45–60 min.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32, width: '100%', maxWidth: 280 }}>
        <button
          type="button"
          className="pill-btn pill-primary"
          onClick={() => { close(); navigate('/orders') }}
        >
          VIEW MY ORDERS →
        </button>
        <button type="button" className="pill-btn pill-secondary" onClick={close}>
          KEEP BROWSING
        </button>
      </div>
    </div>
  )
}
