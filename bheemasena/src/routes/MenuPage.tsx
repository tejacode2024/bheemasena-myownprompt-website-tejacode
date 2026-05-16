import { useRef } from 'react'
import { motion } from 'motion/react'
import { MenuSection } from '../components/sections/MenuSection'
import { Reviews } from '../components/sections/Reviews'
import { Footer } from '../components/layout/Footer'
import { openZomato } from '../lib/zomato'

export default function MenuPage() {
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <main>
      <section
        style={{
          padding: 'clamp(120px,12vw,180px) clamp(24px,6vw,96px) 24px',
          textAlign: 'center',
          maxWidth: 1100, margin: '0 auto',
        }}
      >
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          THE FULL MENU
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          style={{
            margin: '16px auto 0',
            maxWidth: 980,
            fontSize: 'clamp(40px,6vw,80px)',
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            color: 'var(--color-ink)',
          }}
        >
          Every Plate&nbsp;<span className="heading-em">on Offer</span>
        </motion.h1>

        <div
          style={{
            marginTop: 32,
            display: 'flex', gap: 12, flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            className="pill-btn pill-primary"
            onClick={() => menuRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            ORDER ON OUR SITE
          </button>
          <button type="button" className="pill-btn pill-ghost" onClick={openZomato}>
            ORDER ON ZOMATO ↗
          </button>
        </div>
      </section>

      <div ref={menuRef}>
        <MenuSection variant="full" />
      </div>

      <Reviews />
      <Footer />
    </main>
  )
}
