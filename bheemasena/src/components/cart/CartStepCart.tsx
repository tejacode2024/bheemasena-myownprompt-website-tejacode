import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Minus, Trash2, MapPin, Loader2, Banknote, CreditCard } from 'lucide-react'
import { useCartStore } from '../../state/cartStore'
import { useAuthStore } from '../../state/authStore'
import { useUIStore } from '../../state/uiStore'
import { formatPrice } from '../../lib/format'
import { getBrowserLocation, reverseGeocode } from '../../lib/geocode'
import type { AddressData } from '../../state/orderStore'

type FieldKey = keyof AddressData

const REQUIRED: FieldKey[] = ['fullName', 'phone', 'flat', 'street', 'city', 'pincode']

export function CartStepCart() {
  const items    = useCartStore((s) => s.items)
  const inc      = useCartStore((s) => s.inc)
  const dec      = useCartStore((s) => s.dec)
  const remove   = useCartStore((s) => s.remove)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax      = useCartStore((s) => s.tax())
  const total    = useCartStore((s) => s.total())

  const closeCart      = useUIStore((s) => s.closeCart)
  const openTimeline   = useUIStore((s) => s.openTimeline)
  const setAddressDraft = useUIStore((s) => s.setAddressDraft)
  const addressDraft   = useUIStore((s) => s.addressDraft)
  const toast          = useUIStore((s) => s.toast)

  const mode = useAuthStore((s) => s.mode)
  const user = useAuthStore((s) => s.user)

  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState<AddressData>(addressDraft ?? {
    fullName: user?.name ?? '',
    phone:    user?.phone ?? '',
    flat:     '',
    street:   '',
    landmark: '',
    city:     '',
    pincode:  '',
  })
  const [errors, setErrors] = useState<Set<FieldKey>>(new Set())
  const [locLoading, setLocLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({})

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

  const useMyLocation = async () => {
    setLocLoading(true)
    try {
      const { lat, lon } = await getBrowserLocation()
      const r = await reverseGeocode(lat, lon)
      setForm((f) => ({
        ...f,
        street:   r.street  ?? f.street,
        city:     r.city    ?? f.city,
        pincode:  r.pincode ?? f.pincode,
        landmark: r.landmark ?? f.landmark,
      }))
      toast('Address filled from your location.', 'success')
    } catch (e: any) {
      toast(e?.message?.includes('denied') ? 'Location permission denied' : 'Could not fetch location', 'error')
    } finally {
      setLocLoading(false)
    }
  }

  const handleReview = () => {
    const missing = new Set<FieldKey>()
    for (const k of REQUIRED) if (!String(form[k] ?? '').trim()) missing.add(k)
    if (missing.size > 0) {
      setErrors(missing)
      const firstKey = REQUIRED.find((k) => missing.has(k))
      if (firstKey) {
        const el = fieldRefs.current[firstKey]
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus()
      }
      toast('Please complete every required field.', 'error')
      return
    }
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      setErrors(new Set(['phone']))
      toast('Phone must be at least 10 digits.', 'error')
      return
    }
    if (!/^\d{4,8}$/.test(form.pincode)) {
      setErrors(new Set(['pincode']))
      toast('Pincode must be 4–8 digits.', 'error')
      return
    }

    // Save draft + open the timeline overlay (cart drawer closes inside the store action).
    setAddressDraft(form)
    openTimeline({ address: form, payment: 'COD' })
  }

  // The original prompt-for-auth-before-cart flow was on a separate Address step.
  // It's preserved here so the cart never lets you place an order while logged-out.
  useEffect(() => {
    if (mode === 'unauthenticated') {
      // Not closing the cart — just nudge the user to log in or stay as guest.
    }
  }, [mode])

  const promptLogin = () => {
    closeCart()
    navigate(`/login?next=${encodeURIComponent(location.pathname + '?cart=open')}`)
  }

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const isEmpty = items.length === 0

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
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

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
              <button
                type="button" aria-label={`Decrease ${it.name}`}
                onClick={() => dec(it.id)}
                style={iconBtn}
              ><Minus size={12} /></button>
              <span style={{ fontSize: 12, minWidth: 14, textAlign: 'center' }}>{it.qty}</span>
              <button
                type="button" aria-label={`Increase ${it.name}`}
                onClick={() => inc(it.id)}
                style={iconBtn}
              ><Plus size={12} /></button>
            </div>
            <button
              type="button" aria-label={`Remove ${it.name}`}
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

        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--color-muted)' }}>
          <Row label={`Subtotal (${itemCount})`} value={formatPrice(subtotal)} />
          <Row label="Tax (5%)"                  value={formatPrice(tax)} />
          <Row label="Total"                     value={formatPrice(total)} bold />
        </div>

        {/* ── Section B: Delivery Details ─────────── */}
        <div style={{ height: 28 }} />
        <SectionLabel>Delivery Details</SectionLabel>

        <button
          type="button"
          className="pill-btn pill-ghost"
          onClick={useMyLocation}
          disabled={locLoading}
          style={{ marginBottom: 16 }}
        >
          {locLoading
            ? <Loader2 size={14} className="animate-spin" />
            : <MapPin size={14} strokeWidth={1.5} />}
          {locLoading ? 'FETCHING…' : 'USE MY LOCATION'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CartField id="cf-name" label="Full name *" value={form.fullName} onChange={(v) => setField('fullName', v)}
            invalid={errors.has('fullName')} ref={(el) => { fieldRefs.current.fullName = el }} />
          <CartField id="cf-phone" label="Phone *" type="tel" value={form.phone} onChange={(v) => setField('phone', v)}
            invalid={errors.has('phone')} ref={(el) => { fieldRefs.current.phone = el }} />
          <CartField id="cf-flat" label="Flat / House no. *" value={form.flat} onChange={(v) => setField('flat', v)}
            invalid={errors.has('flat')} ref={(el) => { fieldRefs.current.flat = el }} />
          <CartField id="cf-street" label="Street / Area *" value={form.street} onChange={(v) => setField('street', v)}
            invalid={errors.has('street')} ref={(el) => { fieldRefs.current.street = el }} />
          <CartField id="cf-landmark" label="Landmark" value={form.landmark ?? ''} onChange={(v) => setField('landmark', v)} />
          <CartField id="cf-city" label="City *" value={form.city} onChange={(v) => setField('city', v)}
            invalid={errors.has('city')} ref={(el) => { fieldRefs.current.city = el }} />
          <CartField id="cf-pincode" label="Pincode *" value={form.pincode} onChange={(v) => setField('pincode', v)}
            invalid={errors.has('pincode')} ref={(el) => { fieldRefs.current.pincode = el }} />
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

        <div
          aria-disabled="true"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 16px',
            border: '1px solid rgba(14,14,12,0.12)',
            borderRadius: 4,
            opacity: 0.45,
            cursor: 'not-allowed',
          }}
        >
          <CreditCard size={16} strokeWidth={1.5} />
          <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>Pay Online</span>
          <span className="tag-pill" style={{ marginLeft: 'auto' }}>Coming Soon</span>
        </div>

        {mode === 'unauthenticated' && (
          <div style={{
            marginTop: 18, padding: 12,
            background: 'rgba(160,123,42,0.06)',
            border: '1px solid rgba(160,123,42,0.25)',
            borderRadius: 4,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              Log in to save your details
            </div>
            <button
              type="button"
              onClick={promptLogin}
              style={{
                marginTop: 6,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-accent)', fontSize: 12, padding: 0,
                fontFamily: 'inherit', letterSpacing: '0.04em',
              }}
            >
              Go to login →
            </button>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>

      {/* ── Section D: Sticky Footer ────────────── */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 1,
        background: 'var(--color-paper)',
        borderTop: '1px solid rgba(14,14,12,0.08)',
        padding: 16,
      }}>
        <button
          type="button"
          className="pill-btn pill-primary"
          style={{ width: '100%' }}
          disabled={isEmpty}
          onClick={handleReview}
        >
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

type CartFieldProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  invalid?: boolean
}

const CartField = forwardRef<HTMLInputElement, CartFieldProps>(function CartField(
  { id, label, value, onChange, type = 'text', invalid }, ref,
) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={ref}
        type={type}
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={invalid ? { borderColor: 'var(--color-danger)' } : undefined}
      />
    </div>
  )
})

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
