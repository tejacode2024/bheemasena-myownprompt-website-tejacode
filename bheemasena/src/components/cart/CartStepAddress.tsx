import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useUIStore } from '../../state/uiStore'
import { getBrowserLocation, reverseGeocode } from '../../lib/geocode'
import type { AddressData } from '../../state/orderStore'

export function CartStepAddress() {
  const setStep        = useUIStore((s) => s.setStep)
  const toast          = useUIStore((s) => s.toast)
  const setAddressDraft = useUIStore((s) => s.setAddressDraft)
  const existing       = useUIStore((s) => s.addressDraft)

  const [form, setForm] = useState<AddressData>(existing ?? {
    fullName: '',
    phone:    '',
    flat:     '',
    street:   '',
    landmark: '',
    city:     '',
    pincode:  '',
  })
  const [locLoading, setLocLoading] = useState(false)

  const useLocation = async () => {
    setLocLoading(true)
    try {
      const { lat, lon } = await getBrowserLocation()
      const r = await reverseGeocode(lat, lon)
      setForm((f) => ({
        ...f,
        flat:     r.flat     ?? f.flat,
        street:   r.street   ?? f.street,
        landmark: r.landmark ?? f.landmark,
        city:     r.city     ?? f.city,
        pincode:  r.pincode  ?? f.pincode,
      }))
      toast('Address filled from your location.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof GeolocationPositionError ? 'Location permission denied' : 'Could not fetch location'
      toast(msg, 'error')
    } finally {
      setLocLoading(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.phone || !form.flat || !form.street || !form.city || !form.pincode) {
      toast('Please fill all required fields.', 'error')
      return
    }
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      toast('Phone must be at least 10 digits.', 'error')
      return
    }
    if (!/^\d{4,8}$/.test(form.pincode)) {
      toast('Pincode must be 4–8 digits.', 'error')
      return
    }
    setAddressDraft(form)
    setStep('payment')
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <button
          type="button"
          className="pill-btn pill-ghost"
          onClick={useLocation}
          disabled={locLoading}
          style={{ marginBottom: 24 }}
        >
          {locLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} strokeWidth={1.5} />}
          {locLoading ? 'FETCHING…' : 'USE CURRENT LOCATION'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name *" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Phone *"    value={form.phone}    onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
          <Field label="Flat / House no. *" value={form.flat} onChange={(v) => setForm({ ...form, flat: v })} />
          <Field label="Street / Area *"    value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
          <Field label="Landmark"           value={form.landmark ?? ''} onChange={(v) => setForm({ ...form, landmark: v })} />
          <Field label="City *"             value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Pincode *"          value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
        </div>
      </div>

      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(14,14,12,0.08)',
        display: 'flex', gap: 8,
      }}>
        <button type="button" className="pill-btn pill-ghost" onClick={() => setStep('cart')}>
          BACK
        </button>
        <button type="submit" className="pill-btn pill-primary" style={{ flex: 1 }}>
          CONTINUE →
        </button>
      </div>
    </form>
  )
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  const id = `f-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
