import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { MediaPlaceholder } from '../ui/MediaPlaceholder'
import { usePrefersReducedMotion } from '../../lib/format'

export function GiftCard() {
  const sectionRef = useRef<HTMLElement>(null)
  const rotateRef  = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(() => {
    if (reduced || !rotateRef.current || !sectionRef.current) return
    const tween = gsap.fromTo(
      rotateRef.current,
      { rotate: -20 },
      {
        rotate: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 0.6,
        },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, { scope: sectionRef })

  // Refresh on window resize
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleScrollToContacts = () => {
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="gift-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
        className="gift-grid"
      >
        <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 4, overflow: 'hidden' }}>
          <MediaPlaceholder aspect="4/3" label="dining hall" src="/images/giftcard/dining-hall.jpg" />
          <div
            ref={rotateRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -16, top: '50%',
              transform: 'translateY(-50%) rotate(-20deg)',
              transformOrigin: 'center',
              fontSize: 'clamp(48px,7vw,96px)',
              fontStyle: 'italic',
              color: 'var(--color-cream)',
              textShadow: '0 4px 24px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            30% Off
          </div>
        </div>

        <div>
          <span className="eyebrow">GIFT CARD</span>
          <h2
            id="gift-heading"
            style={{
              margin: '16px 0 0',
              fontSize: 'clamp(36px,5vw,64px)',
              fontWeight: 400,
              lineHeight: 1.05,
              color: 'var(--color-ink)',
            }}
          >
            Culinary Delight,&nbsp;<span className="heading-em">Ready to Gift</span>
          </h2>
          <p style={{
            marginTop: 16,
            fontSize: 14, lineHeight: 1.7,
            color: 'var(--color-muted)',
            textTransform: 'none',
            maxWidth: 460,
          }}>
            Treat friends, family, or colleagues to a feast they'll remember — our gift card is delivered
            instantly and redeemable across our full menu.
          </p>
          <button type="button" className="pill-btn pill-primary" style={{ marginTop: 32 }} onClick={handleScrollToContacts}>
            GET GIFT CARD →
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .gift-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  )
}
