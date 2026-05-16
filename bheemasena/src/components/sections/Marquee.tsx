// Marquee.tsx — Curved infinite carousel
import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValue, animate, type PanInfo } from 'motion/react'
import { MediaPlaceholder } from '../ui/MediaPlaceholder'

type Card = {
  id: number
  label: string
  /** Path to the still image. Drop this file into bheemasena/public/. */
  image: string
  /** Optional video — when set it plays in place of the image. */
  video?: string
}

const CARDS: Card[] = [
  { id: 1, label: 'Dining Hall',      image: '/images/marquee/dish-1.jpeg' },
  { id: 2, label: 'Royal Feast',      image: '/images/marquee/dish-2.jpeg' },
  { id: 3, label: 'The Kitchen',      image: '/images/marquee/dish-3.jpeg' },
  { id: 4, label: 'Champaran Mutton', image: '/images/marquee/dish-4.jpeg' },
  { id: 5, label: 'Heritage Room',    image: '/images/marquee/dish-5.jpeg' },
  { id: 6, label: 'Garden Terrace',   image: '/images/marquee/dish-6.jpeg' },
  { id: 7, label: 'Chicken Tandoori', image: '/images/marquee/dish-7.jpeg' },
  { id: 8, label: 'Dragon Chicken',   image: '/images/marquee/dish-8.jpeg' },
]

const N = CARDS.length
const CARD_WIDTH = 320
const CARD_GAP = 16
const CARD_HEIGHT = 420
const STEP = CARD_WIDTH + CARD_GAP

// 5 copies — gives the user a generous swipe margin in either direction
// before a re-anchor is needed (≈20 cards each way).
const COPIES = 5
const VIRTUAL = N * COPIES
const MIDDLE_START = 2 * N
const MIDDLE_END = 3 * N - 1
const INITIAL_ACTIVE = MIDDLE_START + Math.floor(N / 2)

// Track offset that puts card `i` under the viewport centre.
const centeredOffset = (i: number) => STEP * ((VIRTUAL - 1) / 2 - i)

// Physical distance from active, reduced into [-N/2, N/2]. The sign
// reflects which side of active the card sits on; cards beyond ±N/2
// wrap to the opposite side but are far off-screen, so the wrap is
// never seen.
function signedDistance(i: number, active: number): number {
  const raw = i - active
  const mod = ((raw % N) + N) % N
  return mod > N / 2 ? mod - N : mod
}

// Cubic ease-out tween — deterministic, no overshoot.
const TWEEN = {
  type: 'tween' as const,
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
}

export function Marquee() {
  const [active, setActive] = useState(INITIAL_ACTIVE)
  const x = useMotionValue(centeredOffset(INITIAL_ACTIVE))

  // Refs for cross-frame state. Refs avoid stale-closure issues that
  // plague long-lived callbacks like animate().then().
  const animatingRef = useRef(false)
  const isDraggingRef = useRef(false)
  const currentTargetRef = useRef(INITIAL_ACTIVE)

  // Slide x to the target's centered position. After the tween settles
  // (and only if this is still the latest target, and the user isn't
  // mid-drag), silently re-anchor into the middle copy if we've drifted.
  const slideTo = useCallback((target: number) => {
    animatingRef.current = true
    currentTargetRef.current = target
    const controls = animate(x, centeredOffset(target), TWEEN)
    controls.then(() => {
      // Stale check: if a newer slideTo has superseded this one, do nothing.
      if (currentTargetRef.current !== target) return
      animatingRef.current = false
      // Don't fire the silent re-anchor while the user is actively dragging.
      if (isDraggingRef.current) return
      if (target < MIDDLE_START || target > MIDDLE_END) {
        const wrapped = MIDDLE_START + ((target % N) + N) % N
        // Because signedDistance is modular, every card's rotateY/scale
        // for the new `active` matches its current values exactly — the
        // swap is genuinely invisible. We just teleport x and update state.
        x.set(centeredOffset(wrapped))
        currentTargetRef.current = wrapped
        setActive(wrapped)
      }
    })
  }, [x])

  const handleDragStart = () => {
    isDraggingRef.current = true
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDraggingRef.current = false
    const power = info.offset.x + info.velocity.x * 0.25
    const steps = Math.round(-power / STEP)
    if (steps === 0) {
      slideTo(active)
      return
    }
    const next = active + steps
    setActive(next)
    slideTo(next)
  }

  // Tap on a non-active card — motion's onTap differentiates tap from
  // drag, so this works on both mouse and touch.
  const handleCardTap = (i: number) => {
    if (animatingRef.current || isDraggingRef.current) return
    if (i === active) return
    setActive(i)
    slideTo(i)
  }

  const displayActive = ((active % N) + N) % N

  return (
    <section style={{
      padding: 'clamp(64px,8vw,100px) 0',
      background: 'var(--color-paper)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: CARD_HEIGHT + 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        // Perspective on the track parent turns the per-card rotateY
        // into a real 3D curve instead of a flat fan.
        perspective: '1200px',
      }}>
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0.18}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            x,
            display: 'flex',
            gap: CARD_GAP,
            alignItems: 'center',
            willChange: 'transform',
            touchAction: 'pan-y',
            transformStyle: 'preserve-3d',
          }}
        >
          {Array.from({ length: VIRTUAL }, (_, i) => {
            const card = CARDS[((i % N) + N) % N]
            const dist = signedDistance(i, active)
            const rotateY = -dist * 22
            const scale = 1 - Math.min(Math.abs(dist) * 0.06, 0.24)
            const isActive = dist === 0

            return (
              <motion.div
                key={i}
                onTap={() => handleCardTap(i)}
                animate={{ rotateY, scale }}
                transition={TWEEN}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: isActive ? 'grab' : 'pointer',
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  border: '1px solid rgba(14,14,12,0.08)',
                  boxShadow: isActive
                    ? '0 24px 64px rgba(14,14,12,0.18)'
                    : '0 8px 24px rgba(14,14,12,0.08)',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              >
                <MediaPlaceholder
                  aspect="3/4"
                  label={card.label}
                  src={card.image}
                  videoSrc={card.video}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '32px 16px 16px',
                  background: 'linear-gradient(180deg, transparent, rgba(14,14,12,0.55))',
                  color: 'var(--color-cream)',
                  fontSize: 12,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-serif)',
                  pointerEvents: 'none',
                }}>
                  {card.label}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Dot indicators — one per real card */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
      }}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (animatingRef.current || isDraggingRef.current) return
              // Find the nearest "physically close" instance of this
              // modular card index so the slide is short.
              const desired = ((i - (active % N) + N) % N) + active
              setActive(desired)
              slideTo(desired)
            }}
            aria-label={`Go to ${CARDS[i].label}`}
            style={{
              width: i === displayActive ? 20 : 6,
              height: 6,
              borderRadius: 999,
              background: i === displayActive
                ? 'var(--color-accent)'
                : 'rgba(14,14,12,0.15)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Explore Menu button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 40,
      }}>
        <a
          href="/#menu"
          onClick={e => {
            e.preventDefault()
            document
              .getElementById('menu')
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="pill-btn pill-secondary"
          style={{ textDecoration: 'none' }}
        >
          EXPLORE MENU →
        </a>
      </div>
    </section>
  )
}
