import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Minus, Trash2, Banknote, CreditCard, Lock } from 'lucide-react'
import { useCartStore } from '../../state/cartStore'
import { useAuthStore } from '../../state/authStore'
import { useUIStore } from '../../state/uiStore'
import { formatPrice } from '../../lib/format'
import type { AddressData } from '../../state/orderStore'

type FieldKey = 'fullName' | 'phone' | 'address'
const REQUIRED: FieldKey[] = ['fullName', 'phone', 'address']

export function CartStepCart() {
  const items    = useCartStore((s) => s.items)
  const inc      = useCartStore((s) => s.inc)
  const dec      = useCartStore((s) => s.dec)
  const remove   = useCartStore((s) => s.remove)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax      = useCartStore((s) => s.tax())
  const total    = useCartStore((s) => s.total())

  const closeCart       = useUIStore((s) => s.closeCart)
  const openTimeline    = useUIStore((s) => s.openTimeline)
  const setAddressDraft = useUIStore((s) => s.setAddressDraft)
  const addressDraft    = useUIStore((s) => s.addressDraft)
  const toast           = useUIStore((s) => s.toast)

  const mode = useAuthStore((s) => s.mode)
  const user = useAuthStore((s) => s.user)

  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState<AddressData>(addressDraft ?? {
    fullName: user?.name ?? '',
    phone:    user?.phone ?? '',
    address:  '',
  })
  const [errors, setErrors] = useState<Set<FieldKey>>(new Set())

  // Re-pre-fill if the user becomes available after the page is open.
  useEffect(() => {
    if (!addressDraft && user) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.name,
        phone:    f.phone    || user.phone,
      }))
    }
  }, [user, addressDraft])

  const setField = (k: FieldKey, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors.has(k)) {
      const next = new Set(errors); next.delete(k); setErrors(next)
    }
  }

  const handleReview = () => {
    const missing = new Set<FieldKey>()
    for (const k of REQUIRED) if (!String(form[k] ?? '').trim()) missing.add(k)
    if (missing.size > 0) {
      setErrors(missing)
      toast('Please complete every required field.', 'error')
      return
    }
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      setErrors(new Set(['phone']))
      toast('Phone must be at least 10 digits.', 'error')
      return
    }
    setAddressDraft(form)
    openTimeline({ address: form, payment: 'COD' })
  }

  const promptLogin = () => {
    closeCart()
    navigate(`/login?next=${encodeURIComponent(location.pathname + '?cart=open')}`)
  }

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const isEmpty = items.length === 0

  // ── Guest / unauthenticated gate ───────────────────────
  // Users in guest mode (or not signed in at all) cannot proceed past
  // the cart drawer. They must sign in first.
  const needsLogin = mode !== 'authenticated' || !user
  if (needsLogin) {
    return (
      <div style={{
        padding: '64px 32px', textAlign: 'center', color: 'var(--color-muted)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        height: '100%', justifyContent: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--color-cream)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Lock size={22} strokeWidth={1.5} color="var(--color-ink-soft)" />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 400, color: 'var(--color-ink)' }}>
          Sign in to order
        </h3>
        <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 280, textTransform: 'none', marginBottom: 24 }}>
          Please sign in or create an account to place an order — guests can browse, but checkout needs a profile.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 240 }}>
          <button type="button" className="pill-btn pill-primary" onClick={promptLogin}>
            SIGN IN →
          </button>
          <button type="button" className="pill-btn pill-secondary" onClick={closeCart}>
            KEEP BROWSING
          </button>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div style={{
        padding: '64px 24px', textAlign: 'center', color: 'var(--color-muted)',
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

        {/* ── Section A: Order Items ───────────────── */}
        <SectionLabel>Order Items</SectionLabel>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: 10, alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid rgba(14,14,12,0.06)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 14, color: 'var(--color-ink)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
                {formatPrice(it.price)} each
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink)' }}>
              {formatPrice(it.price * it.qty)}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--color-cream)',
              padding: '4px 6px', borderRadius: 999,
            }}>
              <button type="button" aria-label={`Decrease ${it.name}`}
                onClick={() => dec(it.id)} style={iconBtn}>
                <Minus size={12} />
              </button>
              <span style={{ fontSize: 12, minWidth: 14, textAlign: 'center' }}>{it.qty}</span>
              <button type="button" aria-label={`Increase ${it.name}`}
                onClick={() => inc(it.id)} style={iconBtn}>
                <Plus size={12} />
              </button>
            </div>
            <button type="button" aria-label={`Remove ${it.name}`}
              onClick={() => remove(it.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-muted)', padding: 6,
              }}>
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}

        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--color-muted)' }}>
          <Row label={`Subtotal (${itemCount})`} value={formatPrice(subtotal)} />
          <Row label="Tax (5%)"                  value={formatPrice(tax)} />
          <Row label="Total"                     value={formatPrice(total)} bold />
        </div>

        {/* ── Section B: Delivery Details ─────────── */}
        <div style={{ height: 28 }} />
        <SectionLabel>Delivery Details</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label" htmlFor="cf-name">Full name *</label>
            <input id="cf-name" className="field-input" value={form.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              style={errors.has('fullName') ? { borderColor: 'var(--color-danger)' } : undefined} />
          </div>
          <div>
            <label className="field-label" htmlFor="cf-phone">Phone *</label>
            <input id="cf-phone" type="tel" className="field-input" value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              style={errors.has('phone') ? { borderColor: 'var(--color-danger)' } : undefined} />
          </div>
          <div>
            <label className="field-label" htmlFor="cf-address">Delivery address *</label>
            <textarea
              id="cf-address"
              className="field-input"
              value={form.address ?? ''}
              onChange={(e) => setField('address', e.target.value)}
              placeholder="House / flat, street, landmark, city, pincode — anything the rider needs."
              rows={5}
              style={{
                resize: 'vertical',
                minHeight: 110,
                lineHeight: 1.5,
                padding: '12px 14px',
                ...(errors.has('address') ? { borderColor: 'var(--color-danger)' } : {}),
              }}
            />
          </div>
        </div>

        {/* ── Section C: Payment Mode ─────────────── */}
        <div style={{ height: 28 }} />
        <SectionLabel>Payment Mode</SectionLabel>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          border: '1px solid var(--color-accent)',
          background: 'var(--color-accent-dim)',
          borderRadius: 4,
          marginBottom: 8, cursor: 'pointer',
        }}>
          <Banknote size={16} strokeWidth={1.5} color="var(--color-accent)" />
          <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>Cash on Delivery</span>
        </div>

        <div aria-disabled="true" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          border: '1px solid rgba(14,14,12,0.12)',
          borderRadius: 4,
          opacity: 0.45,
          cursor: 'not-allowed',
        }}>
          <CreditCard size={16} strokeWidth={1.5} />
          <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>Pay Online</span>
          <span className="tag-pill" style={{ marginLeft: 'auto' }}>Coming Soon</span>
        </div>

        <div style={{ height: 24 }} />
      </div>

      {/* ── Section D: Sticky Footer ────────────── */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 1,
        background: 'var(--color-paper)',
        borderTop: '1px solid rgba(14,14,12,0.08)',
        padding: 16,
      }}>
        <button type="button" className="pill-btn pill-primary"
          style={{ width: '100%' }}
          disabled={isEmpty}
          onClick={handleReview}>
          REVIEW ORDER →
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: '0.25em',
      color: 'var(--color-muted)',
      marginBottom: 12, textTransform: 'uppercase',
    }}>
      {children}
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

const iconBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
