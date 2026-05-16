import { Link } from 'react-router-dom'
import { Camera, ThumbsUp, Globe } from 'lucide-react'
import { SITE } from '../../data/site'

export function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--color-ink)',
        color: 'var(--color-cream)',
        padding: 'clamp(64px,8vw,100px) clamp(24px,6vw,96px) 32px',
        marginTop: 0,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
          gap: 48,
          maxWidth: 1280,
          margin: '0 auto',
        }}
        className="footer-grid"
      >
        <div>
          <div style={{ fontSize: 22, letterSpacing: '0.04em' }}>Bheemasena</div>
          <p style={{
            marginTop: 16, fontStyle: 'italic',
            fontSize: 13, color: 'rgba(246,242,236,0.65)',
            textTransform: 'none', lineHeight: 1.6, maxWidth: 360,
          }}>
            A great warrior. A greater appetite. Dine where epics were born.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.30em', color: 'rgba(246,242,236,0.55)', marginBottom: 20 }}>
            NAVIGATE
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'About', to: '/#about' },
              { label: 'Menu', to: '/menu' },
              { label: 'Team', to: '/#team' },
              { label: 'Blog', to: '/blog' },
              { label: 'Contacts', to: '/#contacts' },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  style={{
                    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(246,242,236,0.75)',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cream)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(246,242,236,0.75)')}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.30em', color: 'rgba(246,242,236,0.55)', marginBottom: 20 }}>
            CONNECT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: 'rgba(246,242,236,0.75)' }}>
            <div>{SITE.address}</div>
            <div>{SITE.hoursWeekday}</div>
            <a href={`tel:${SITE.phoneE164}`}>{SITE.phoneDisplay}</a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
            <a href={SITE.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
               style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(246,242,236,0.75)' }}>
              <Camera size={14} strokeWidth={1.5} /> Instagram
            </a>
            <a href={SITE.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
               style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(246,242,236,0.75)' }}>
              <ThumbsUp size={14} strokeWidth={1.5} /> Facebook
            </a>
            <a href={SITE.socials.tripadvisor} target="_blank" rel="noopener noreferrer" aria-label="Tripadvisor"
               style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(246,242,236,0.75)' }}>
              <Globe size={14} strokeWidth={1.5} /> Tripadvisor
            </a>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1280, margin: '56px auto 0',
        paddingTop: 24,
        borderTop: '1px solid rgba(246,242,236,0.10)',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontSize: 10, color: 'rgba(246,242,236,0.40)', letterSpacing: '0.04em' }}>
          © 2026 Bheemasena. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ fontSize: 10, color: 'rgba(246,242,236,0.55)', letterSpacing: '0.15em' }}>Privacy</a>
          <a href="#" style={{ fontSize: 10, color: 'rgba(246,242,236,0.55)', letterSpacing: '0.15em' }}>Terms</a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </footer>
  )
}
