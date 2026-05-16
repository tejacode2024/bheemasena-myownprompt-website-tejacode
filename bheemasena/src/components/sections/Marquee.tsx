// Marquee.tsx — Curved infinite carousel
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
const CARD_GAP = 16
const ASPECT = 3 / 4  // width : height

// 3 copies of the cards array. The middle copy is "home"; when active
// drifts into an outer copy we silently re-anchor back to home. Fewer
// copies means much less per-frame work — important for mobile drag.
const COPIES = 3
const VIRTUAL = N * COPIES
const SAFE_START = N            // 8
const SAFE_END = 2 * N - 1      // 15
const INITIAL_ACTIVE = Math.floor(VIRTUAL / 2)  // 12
const MIDDLE_COPY_START = N     // 8

// Cubic ease-out tween — deterministic, no spring overshoot.
const TWEEN = {
  type: 'tween' as const,
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
}

// Single card width across every viewport — restored to the original
// 320 so mobile cards look as prominent as the desktop ones.
function pickCardWidth(): number {
  return 320
}

// Physical distance from active, reduced into [-N/2, N/2]. The sign
// reflects which physical side of active the card sits on; cards
// beyond ±N/2 wrap to the opposite side, but they're far off-screen
// at that point so the wrap is never seen.
function signedDistance(i: number, active: number): number {
  const raw = i - active
  const mod = ((raw % N) + N) % N
  return mod > N / 2 ? mod - N : mod
}

export function Marquee() {
  const [active, setActive] = useState(INITIAL_ACTIVE)
  const [cardWidth, setCardWidth] = useState<number>(pickCardWidth)

  const CARD_HEIGHT = useMemo(() => Math.round(cardWidth / ASPECT), [cardWidth])
  const STEP = cardWidth + CARD_GAP

  const centeredOffset = useCallback(
    (i: number) => STEP * ((VIRTUAL - 1) / 2 - i),
    [STEP],
  )

  const x = useMotionValue(centeredOffset(INITIAL_ACTIVE))

  // Refs for cross-frame state. Refs avoid stale-closure issues that
  // plague long-lived callbacks like animate().then().
  const animatingRef = useRef(false)
  const isDraggingRef = useRef(false)
  const dragMovedRef = useRef(false)
  const currentTargetRef = useRef(INITIAL_ACTIVE)

  // Resize listener: re-pick a card width if the viewport crosses a
  // breakpoint, and re-anchor x so the active card stays centered.
  useEffect(() => {
    const onResize = () => {
      const w = pickCardWidth()
      setCardWidth(prev => (prev === w ? prev : w))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Always read the latest active inside the resize-snap effect without
  // putting `active` in the dep array (we only want to snap on resize).
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    // After cardWidth changes, snap x to the current active's new centered
    // position — no animation, just a jump. Crucially does NOT fire on
    // active changes; those go through slideTo with a smooth tween.
    x.set(centeredOffset(activeRef.current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centeredOffset, x])

  // Slide x to the target's centered position. After the tween settles
  // (and only if this is still the latest target, and the user isn't
  // mid-drag), silently re-anchor into the middle range if active has
  // drifted to the very edge.
  const slideTo = useCallback((target: number) => {
    animatingRef.current = true
    currentTargetRef.current = target
    const controls = animate(x, centeredOffset(target), TWEEN)
    controls.then(() => {
      if (currentTargetRef.current !== target) return
      animatingRef.current = false
      if (isDraggingRef.current) return
      if (target < SAFE_START || target > SAFE_END) {
        // Bring active into the middle copy at the same modular index.
        const safe = MIDDLE_COPY_START + ((target % N) + N) % N
        x.set(centeredOffset(safe))
        currentTargetRef.current = safe
        setActive(safe)
      }
    })
  }, [x, centeredOffset])

  const handleDragStart = () => {
    isDraggingRef.current = true
    // Don't flip dragMovedRef here — motion fires onDragStart on the
    // first pixel of movement, but we only want to suppress the
    // following synthetic click if the user *actually* dragged. That
    // gets set in onDrag below, which fires on every drag movement.
  }
  const handleDrag = () => {
    dragMovedRef.current = true
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDraggingRef.current = false
    const power = info.offset.x + info.velocity.x * 0.25
    const ratio = -power / STEP

    // Commit to a card step in the drag direction whenever the drag
    // is more than ~20% of a card width. Below that it's a tap / wobble,
    // so just snap back. This eliminates the snap-back-against-the-drag
    // sensation that produces the "front+back" jolt.
    let steps: number
    const absRatio = Math.abs(ratio)
    if (absRatio < 0.2) {
      steps = 0
    } else {
      steps = Math.sign(ratio) * Math.max(1, Math.round(absRatio))
    }

    // Clear the dragMoved flag after the click event has had a chance
    // to fire (and be ignored). The synthetic click follows pointerup
    // by a few ms.
    setTimeout(() => { dragMovedRef.current = false }, 50)

    if (steps === 0) {
      slideTo(active)
      return
    }
    const next = active + steps
    setActive(next)
    slideTo(next)
  }

  // Mouse click + touch — onClick fires reliably on both. The
  // dragMovedRef guard suppresses the synthetic click that fires
  // right after a real drag ends. Animations CAN be interrupted by a
  // tap, so we don't gate on animatingRef.
  const handleCardClick = (i: number) => {
    if (dragMovedRef.current) return
    if (isDraggingRef.current) return
    if (i === active) return
    setActive(i)
    slideTo(i)
  }

  const displayActive = ((active % N) + N) % N

  return (
    <section style={{
      padding: 'clamp(48px,7vw,100px) 0',
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
          onDrag={handleDrag}
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
                onClick={() => handleCardClick(i)}
                animate={{ rotateY, scale }}
                transition={TWEEN}
                style={{
                  width: cardWidth,
                  height: CARD_HEIGHT,
                  borderRadius: 18,
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: isActive ? 'grab' : 'pointer',
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  border: '1px solid rgba(14,14,12,0.08)',
                  // Active card gets a layered drop-shadow so it visibly
                  // floats above the others. Inactive cards get a softer,
                  // tighter shadow so they recede in the perspective curve.
                  boxShadow: isActive
                    ? '0 4px 12px rgba(14,14,12,0.10), 0 28px 60px rgba(14,14,12,0.28), 0 56px 100px rgba(14,14,12,0.18)'
                    : '0 3px 10px rgba(14,14,12,0.05)',
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
              // Pick the nearest (physical) instance of this modular index.
              const cur = ((active % N) + N) % N
              const fwd = ((i - cur) + N) % N      // 0..N-1 forward steps
              const bwd = fwd - N                  // -(N-fwd) backward
              const delta = Math.abs(fwd) <= Math.abs(bwd) ? fwd : bwd
              const next = active + delta
              setActive(next)
              slideTo(next)
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
