import { useState } from 'react'
import type { FormEvent } from 'react'
import { MapPin, Clock, Phone, Mail } from 'lucide-react'
import { SITE } from '../../data/site'
import { useUIStore } from '../../state/uiStore'

export function Contacts() {
  const toast = useUIStore((s) => s.toast)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast('Please fill name, email, and message.', 'error')
      return
    }
    console.log('Contact form submission:', form)
    toast("Thanks — we'll be in touch shortly.", 'success')
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <section
      id="contacts"
      aria-labelledby="contacts-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
        maxWidth: 1180, margin: '0 auto',
      }}
    >
      <h2
        id="contacts-heading"
        style={{
          textAlign: 'center',
          margin: '0 auto 64px',
          fontSize: 'clamp(40px,6vw,80px)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-ink)',
        }}
      >
        Get&nbsp;<span className="heading-em">in</span>&nbsp;Touch&nbsp;<span className="heading-em">with</span>&nbsp;Us
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 64,
        }}
        className="contacts-grid"
      >
        <form onSubmit={submit} aria-label="Send a message">
          <div style={{
            fontSize: 14, letterSpacing: '0.25em',
            color: 'var(--color-muted)',
            marginBottom: 24, textTransform: 'uppercase',
          }}>
            Message Us
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label" htmlFor="cf-name">Name</label>
              <input
                id="cf-name"
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="cf-email">Email</label>
              <input
                id="cf-email"
                type="email"
                className="field-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="cf-phone">Phone (optional)</label>
              <input
                id="cf-phone"
                className="field-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message"
                className="field-input"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="pill-btn pill-primary" style={{ width: '100%' }}>
              SUBMIT →
            </button>
          </div>
        </form>

        <div>
          <div style={{
            fontSize: 14, letterSpacing: '0.25em',
            color: 'var(--color-muted)',
            marginBottom: 24, textTransform: 'uppercase',
          }}>
            Contact Info
          </div>

          <InfoRow icon={<MapPin size={16} strokeWidth={1.5} />} lines={[SITE.address, SITE.location]} />
          <InfoRow icon={<Clock size={16} strokeWidth={1.5} />}   lines={[SITE.hoursWeekday, SITE.hoursWeekend]} />
          <InfoRow icon={<Phone size={16} strokeWidth={1.5} />}   lines={[<a href={`tel:${SITE.phoneE164}`}>{SITE.phoneDisplay}</a>]} />
          <InfoRow icon={<Mail size={16} strokeWidth={1.5} />}    lines={[<a href={`mailto:${SITE.email}`}>{SITE.email}</a>]} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contacts-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}

function InfoRow({ icon, lines }: { icon: React.ReactNode; lines: React.ReactNode[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <span style={{ color: 'var(--color-ink-soft)', marginTop: 2 }}>{icon}</span>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-ink)', textTransform: 'none' }}>
        {lines.map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  )
}
