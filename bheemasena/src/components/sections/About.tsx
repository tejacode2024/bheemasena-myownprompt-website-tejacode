import { motion } from 'motion/react'

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
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 48 }}
      >
        <div style={{
          width: 60, height: 1,
          background: 'var(--color-accent)',
          margin: '0 auto 20px',
        }} />

        <div style={{
          fontSize: 10, letterSpacing: '0.35em',
          color: 'var(--color-muted)', textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          EST. ANCIENT · HASTINAPURA
        </div>

        <h2 style={{
          margin: '12px 0 0',
          fontSize: 'clamp(52px, 10vw, 120px)',
          fontWeight: 400,
          fontFamily: 'var(--font-serif)',
          fontStyle: 'normal',
          color: 'var(--color-ink)',
          textAlign: 'center',
          lineHeight: 0.92,
          letterSpacing: '-0.02em',
        }}>
          Hotel Bheemasena
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginTop: 20,
        }}>
          <span style={{
            display: 'inline-block', width: 40, height: 1,
            background: 'var(--color-accent)',
          }} />
          <span style={{
            fontSize: 14, color: 'var(--color-accent)',
          }}>✦</span>
          <span style={{
            display: 'inline-block', width: 40, height: 1,
            background: 'var(--color-accent)',
          }} />
        </div>
      </motion.div>

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
    </section>
  )
}
