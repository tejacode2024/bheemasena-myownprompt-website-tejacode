import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { MENU, type MenuCategory } from '../../data/menu'
import { MenuTabs } from '../menu/MenuTabs'
import { MenuCard } from '../menu/MenuCard'
import { openZomato } from '../../lib/zomato'

type Props = { variant?: 'preview' | 'full' }

export function MenuSection({ variant = 'preview' }: Props) {
  const [active, setActive] = useState<MenuCategory>('Starters')

  const items = useMemo(() => {
    const all = MENU.filter((m) => m.category === active)
    return variant === 'preview' ? all.slice(0, 4) : all
  }, [active, variant])

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          MENU
        </motion.span>
        <motion.h2
          id="menu-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          style={{
            margin: '16px auto 0',
            maxWidth: 980,
            fontSize: 'clamp(40px, 6vw, 80px)',
            fontWeight: 400,
            lineHeight: 1.0,
            color: 'var(--color-ink)',
            letterSpacing: '-0.01em',
          }}
        >
          Authentic Dishes,&nbsp;
          <span className="heading-em">Perfected Since the Age of Legends</span>
        </motion.h2>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <MenuTabs active={active} onChange={setActive} />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
              gap: '24px 40px',
            }}
            className="menu-grid"
          >
            {items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>

        {variant === 'preview' && (
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/menu" className="pill-btn pill-secondary">SEE ALL MENU →</Link>
            <button type="button" className="pill-btn pill-ghost" onClick={openZomato}>
              ORDER ON ZOMATO ↗
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
      `}</style>
    </section>
  )
}
