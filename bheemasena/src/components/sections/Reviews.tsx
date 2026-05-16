import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { REVIEWS } from '../../data/reviews'

export function Reviews() {
  const railRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dx: number) => {
    railRef.current?.scrollBy({ left: dx, behavior: 'smooth' })
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) 0',
        background: 'var(--color-cream)',
      }}
    >
      <div
        style={{
          padding: '0 clamp(24px,6vw,96px)',
          marginBottom: 48,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <span className="eyebrow">REVIEWS</span>
        <h2
          id="reviews-heading"
          style={{
            margin: '16px auto 0',
            fontSize: 'clamp(36px,5vw,64px)',
            fontWeight: 400,
            lineHeight: 1.05,
            color: 'var(--color-ink)',
          }}
        >
          Tales from&nbsp;<span className="heading-em">Our Table</span>
        </h2>

        <div style={{
          display: 'flex', gap: 8,
          justifyContent: 'center', marginTop: 24,
        }}>
          <button
            type="button"
            aria-label="Scroll reviews left"
            onClick={() => scrollBy(-340)}
            className="pill-btn pill-ghost"
            style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Scroll reviews right"
            onClick={() => scrollBy(340)}
            className="pill-btn pill-ghost"
            style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: 20,
          padding: '0 clamp(24px,6vw,96px)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
        }}
      >
        {REVIEWS.map((r, i) => (
          <article
            key={i}
            style={{
              flexShrink: 0,
              width: 'clamp(280px, 32vw, 380px)',
              padding: 32,
              background: '#fff',
              borderRadius: 4,
              border: '1px solid rgba(14,14,12,0.06)',
              scrollSnapAlign: 'start',
            }}
          >
            <blockquote style={{
              margin: 0,
              fontStyle: 'italic',
              fontSize: 16, lineHeight: 1.6,
              color: 'var(--color-ink)',
              textTransform: 'none',
              marginBottom: 24,
            }}>
              "{r.quote}"
            </blockquote>
            <div style={{ width: 24, height: 1, background: 'var(--color-accent)' }} />
            <div style={{
              marginTop: 16,
              fontSize: 11, letterSpacing: '0.20em',
              color: 'var(--color-ink)',
            }}>
              {r.name.toUpperCase()}
            </div>
            <div style={{
              fontSize: 9, letterSpacing: '0.20em',
              color: 'var(--color-muted)',
              marginTop: 4, textTransform: 'uppercase',
            }}>
              {r.context}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
