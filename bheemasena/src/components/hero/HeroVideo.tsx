import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'
import { usePrefersReducedMotion } from '../../lib/format'
import { useUIStore } from '../../state/uiStore'
import { SITE } from '../../data/site'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.10 } } }
const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const } },
}

export function HeroVideo() {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<'video' | 'image'>(reduced ? 'image' : 'video')
  const videoRef = useRef<HTMLVideoElement>(null)
  const openReserve = useUIStore((s) => s.openReserve)

  useEffect(() => {
    if (phase !== 'video') return
    const v = videoRef.current
    if (!v) return
    const onEnded = () => setPhase('image')
    const onError = () => setPhase('image')
    v.addEventListener('ended', onEnded)
    v.addEventListener('error', onError)
    return () => {
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('error', onError)
    }
  }, [phase])

  return (
    <section
      aria-label="Welcome to Bheemasena"
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(100svh, 920px)',
        minHeight: '88svh',
        overflow: 'hidden',
        background: 'var(--color-paper)',
      }}
    >
      <AnimatePresence initial={false}>
        {phase === 'video' ? (
          <motion.video
            key="hero-video"
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/images/bheemasena-intro-picture.jpeg"
            src="/videos/bheemasena-intro-video.mp4"
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <motion.img
            key="hero-image"
            src="/images/bheemasena-intro-picture.jpeg"
            alt="Bheemasena dining hall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </AnimatePresence>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(180deg, rgba(251,248,243,0.55) 0%, rgba(251,248,243,0.20) 40%, rgba(251,248,243,0.10) 70%, rgba(14,14,12,0.25) 100%)',
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative', zIndex: 10,
          height: '100%',
          padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px) clamp(48px,6vw,80px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          maxWidth: 1280, margin: '0 auto',
        }}
      >
        <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', width: 28, height: 1,
            background: 'rgba(14,14,12,0.55)', marginRight: 16,
          }} />
          <span style={{
            fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'var(--color-ink)',
          }}>
            ★ Hastinapura / Est. Ancient
          </span>
        </motion.div>

        <h1 style={{ margin: 0, textShadow: '0 2px 16px rgba(251,248,243,0.55)' }}>
          <ClipLine>
            <span style={lineStyle}>Celebration</span>
          </ClipLine>
          <ClipLine delay={0.10}>
            <span style={lineStyle}>
              <span className="heading-em">of</span> <span>Flavor</span>
            </span>
          </ClipLine>
          <ClipLine delay={0.20}>
            <span style={lineStyle}>
              <span className="heading-em">and</span> <span>Ambiance</span>
            </span>
          </ClipLine>
        </h1>

        <motion.p
          variants={item}
          style={{
            marginTop: 24,
            fontSize: 'clamp(13px, 1.3vw, 16px)',
            lineHeight: 1.7,
            color: 'var(--color-ink)',
            textShadow: '0 2px 16px rgba(251,248,243,0.55)',
            maxWidth: 520,
            letterSpacing: '0.02em',
            textTransform: 'none',
          }}
        >
          Join us for a feast worthy of legends, crafted with passion and inspired by seasonal flavors of the subcontinent.
        </motion.p>

        <motion.div
          variants={item}
          style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          <button type="button" className="pill-btn pill-primary" onClick={openReserve}>
            BOOK A TABLE →
          </button>
          <Link to="/menu" className="pill-btn pill-secondary">
            SEE MENU →
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          style={{
            marginTop: 40,
            display: 'flex', flexWrap: 'wrap',
            gap: '24px 40px',
          }}
        >
          <InfoBlock icon={<MapPin size={16} strokeWidth={1.5} />} label="LOCATION" value={SITE.address} />
          <InfoBlock icon={<Clock size={16} strokeWidth={1.5} />}   label="HOURS" value={SITE.hoursWeekday} />
          <InfoBlock icon={<Clock size={16} strokeWidth={1.5} />}   label="WEEKEND" value={SITE.hoursWeekend} />
        </motion.div>
      </motion.div>
    </section>
  )
}

const lineStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'clamp(48px, 9vw, 120px)',
  fontWeight: 400,
  lineHeight: 0.94,
  letterSpacing: '-0.01em',
  color: 'var(--color-ink)',
}

function ClipLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.10 + delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function InfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: 'var(--color-ink)', marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--color-ink-soft)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--color-ink)', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}
