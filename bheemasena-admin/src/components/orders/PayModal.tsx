import { useState } from 'react'
import { CheckCircle2, X, FileSpreadsheet } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Spinner } from '../ui/Spinner'
import { api, type RawOrder } from '../../lib/api'
import { useAdminStore } from '../../state/adminStore'
import { useOrdersStore } from '../../state/ordersStore'
import { useUIStore } from '../../state/uiStore'
import { tokenDisplay, fmtMoney } from '../../lib/format'

type PayStatus = 'paid' | 'unpaid' | 'pending'

export function PayModal({ order, open, onClose }: { order: RawOrder; open: boolean; onClose: () => void }) {
  const secret = useAdminStore(s => s.secret)
  const patchLocal = useOrdersStore(s => s.patchLocal)
  const toast = useUIStore(s => s.addToast)

  const [choice, setChoice] = useState<PayStatus | null>(null)
  const [pendingAmt, setPendingAmt] = useState('')
  const [saving, setSaving] = useState(false)

  async function confirm() {
    if (!choice) return
    const body: any = {
      deliver_status: 'delivered',
      pay_status: choice,
      pending_amount: choice === 'pending' ? Number(pendingAmt || 0) : null,
    }
    setSaving(true)
    try {
      patchLocal(order.token_number, { ...body, delivered_at: new Date().toISOString() })
      await api.patchOrder(order.token_number, body, secret)
      toast(`Order ${tokenDisplay(order.token_number)} delivered`, 'success')
      onClose()
    } catch (e: any) {
      toast(e?.message || 'Failed to update', 'error')
      patchLocal(order.token_number, { deliver_status: 'pending', pay_status: order.pay_status })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Payment status"
      subtitle={`${tokenDisplay(order.token_number)} · ${order.customer_name} · ${fmtMoney(order.total)}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <RadioCard
          icon={<CheckCircle2 size={18} strokeWidth={1.5} />}
          label="Paid in full"
          tone="success"
          active={choice === 'paid'}
          onClick={() => setChoice('paid')}
        />
        <RadioCard
          icon={<X size={18} strokeWidth={1.5} />}
          label="Not paid"
          tone="danger"
          active={choice === 'unpaid'}
          onClick={() => setChoice('unpaid')}
        />
        <RadioCard
          icon={<FileSpreadsheet size={18} strokeWidth={1.5} />}
          label="Partial / pending"
          tone="warning"
          active={choice === 'pending'}
          onClick={() => setChoice('pending')}
        />
        {choice === 'pending' && (
          <div style={{ paddingLeft: 12 }}>
            <label className="admin-label">Pending amount ₹</label>
            <input
              className="admin-input"
              type="number"
              min={0}
              value={pendingAmt}
              onChange={(e) => setPendingAmt(e.target.value)}
              placeholder="0"
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="pill-btn pill-ghost" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="pill-btn pill-accent"
          disabled={!choice || saving}
          onClick={confirm}
        >
          {saving ? <Spinner size={12} /> : 'Confirm & deliver →'}
        </button>
      </div>
    </Sheet>
  )
}

function RadioCard({
  icon, label, tone, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  tone: 'success' | 'danger' | 'warning'
  active: boolean
  onClick: () => void
}) {
  const ring = tone === 'success' ? 'var(--color-success)'
            : tone === 'danger'  ? 'var(--color-danger)'
            : 'var(--color-warning)'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: active ? 'rgba(139,107,61,0.04)' : 'var(--color-admin-surface)',
        border: `1.5px solid ${active ? ring : 'var(--color-admin-border)'}`,
        borderRadius: 6, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 13, color: 'var(--color-ink)', textAlign: 'left',
      }}
    >
      <span style={{ color: ring, display: 'inline-flex' }}>{icon}</span>
      {label}
    </button>
  )
}
