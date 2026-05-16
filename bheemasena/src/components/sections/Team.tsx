import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { TEAM } from '../../data/team'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'
import { usePrefersReducedMotion } from '../../lib/format'

export function Team() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const cardsRef  = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(() => {
    if (reduced || !wrapRef.current || !cardsRef.current) return
    const cards = cardsRef.current.querySelectorAll<HTMLElement>('[data-team-card]')

    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      gsap.set(cards, { x: 80, opacity: 0 })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current!,
          start: 'top top',
          end:   '+=600',
          pin: true,
          scrub: 0.5,
        },
      })
      cards.forEach((card, i) => {
        tl.to(card, { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }, i * 0.15)
      })
    })

    return () => {
      mm.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === wrapRef.current) st.kill()
      })
    }
  }, { scope: wrapRef })

  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      ref={wrapRef}
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <span className="eyebrow">TEAM</span>
        <h2
          id="team-heading"
          style={{
            margin: '16px auto 0',
            fontSize: 'clamp(40px,6vw,80px)',
            fontWeight: 400,
            lineHeight: 1.0,
            color: 'var(--color-ink)',
          }}
        >
          The People Behind&nbsp;<span className="heading-em">the Plates</span>
        </h2>
        <p style={{
          marginTop: 16, fontSize: 14,
          color: 'var(--color-muted)', textTransform: 'none',
          maxWidth: 540, margin: '16px auto 0',
        }}>
          Crafted with care, served with passion — our team brings the flavor to life.
        </p>
      </div>

      <div
        ref={cardsRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
          gap: 24,
        }}
        className="team-grid"
      >
        {TEAM.map((m) => (
          <article
            key={m.name}
            data-team-card
            className="card-paper"
            style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ marginBottom: 20 }}>
              <ImagePlaceholder aspect="4/5" label="portrait" />
            </div>
            <div style={{
              fontSize: 9, letterSpacing: '0.30em',
              color: 'var(--color-accent)',
              marginBottom: 8, textTransform: 'uppercase',
            }}>
              {m.role}
            </div>
            <h3 style={{
              margin: 0, fontSize: 22, fontWeight: 400,
              color: 'var(--color-ink)', marginBottom: 12,
            }}>
              {m.name}
            </h3>
            <p style={{
              margin: 0, fontSize: 12, lineHeight: 1.7,
              color: 'var(--color-muted)', textTransform: 'none',
            }}>
              {m.bio}
            </p>
          </article>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .team-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 640px) {
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
