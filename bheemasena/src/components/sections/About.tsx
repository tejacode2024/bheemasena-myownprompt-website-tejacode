import { motion } from 'motion/react'
import {
  Sun, Users, Gift, Wifi, ShoppingBag, CigaretteOff, ParkingCircle, BatteryCharging,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AMENITIES } from '../../data/amenities'

const ICONS: Record<string, LucideIcon> = {
  Sun, Users, Gift, Wifi, ShoppingBag, CigaretteOff, ParkingCircle, BatteryCharging,
}

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
        maxWidth: 1100, margin: '0 auto', textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span id="about-heading" className="eyebrow" style={{ marginBottom: 24, display: 'inline-block' }}>
          ABOUT
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        style={{
          fontSize: 'clamp(20px, 2.4vw, 32px)',
          lineHeight: 1.5,
          color: 'var(--color-ink)',
          marginTop: 24,
        }}
      >
        Born of the Mahabharata legend, <em>Bheemasena</em> honours the warrior whose hunger was as mighty as his mace.
        Our kitchen draws from the <em>royal courts</em> of Hastinapura, the <em>spice routes</em> of the Deccan,
        and the <em>coastal feasts</em> of the Konkan — served in a room where tradition and contemporary craft
        sit at the same table.
      </motion.p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
          gap: '32px 24px',
          marginTop: 64,
        }}
        className="amenities-grid"
      >
        {AMENITIES.map((a, idx) => {
          const Icon = ICONS[a.icon]
          return (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.06 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {Icon && <Icon size={24} strokeWidth={1.5} color="var(--color-ink-soft)" />}
              <div style={{
                marginTop: 10, fontSize: 11, letterSpacing: '0.18em',
                color: 'var(--color-muted)', textTransform: 'uppercase',
              }}>
                {a.label}
              </div>
            </motion.div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .amenities-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
      `}</style>
    </section>
  )
}
