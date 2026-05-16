import { Fragment, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { MENU } from '../../data/menu'
import { MenuTabs } from '../menu/MenuTabs'
import { MenuCategoryBlock, categoryAnchor } from '../menu/MenuCategoryBlock'
import { openZomato } from '../../lib/zomato'

const CATEGORIES = [
  'Veg Starters',
  'Non-Veg Starters',
  'Veg Biryani',
  'Non-Veg Biryani',
  'Mini Biryani',
  'Breads',
  'Veg Curries',
  'Non-Veg Curries',
] as const

type Category = (typeof CATEGORIES)[number]

const HERO_BY_CATEGORY: Record<Category, string> = {
  'Veg Starters':     '/images/menu/category-veg-starters.jpeg',
  'Non-Veg Starters': '/images/menu/category-non-veg-starters.jpg',
  'Veg Biryani':      '/images/menu/category-veg-biryani.jpeg',
  'Non-Veg Biryani':  '/images/menu/category-non-veg-biryani.jpeg',
  'Mini Biryani':     '/images/menu/category-mini-biryani.jpeg',
  'Breads':           '/images/menu/category-breads.jpg',
  'Veg Curries':      '/images/menu/category-veg-curries.jpeg',
  'Non-Veg Curries':  '/images/menu/category-non-veg-curries.jpeg',
}

type Props = { variant?: 'preview' | 'full' }

export function MenuSection({ variant = 'preview' }: Props) {
  const [active, setActive] = useState<Category>(CATEGORIES[0])

  const itemsByCategory = useMemo(() => {
    const map: Record<Category, ReturnType<typeof MENU.filter>> = {} as Record<Category, ReturnType<typeof MENU.filter>>
    for (const cat of CATEGORIES) {
      map[cat] = MENU.filter((m) => (m.category as string) === cat)
    }
    return map
  }, [])

  // Variant='full' tab clicks scroll-snap to that category's block.
  useEffect(() => {
    if (variant !== 'full') return
    const el = document.getElementById(categoryAnchor(active))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [active, variant])

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
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

      <MenuTabs
        categories={CATEGORIES as readonly string[]}
        active={active}
        onChange={(c) => setActive(c as Category)}
      />

      {variant === 'preview' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <MenuCategoryBlock
              category={active}
              items={itemsByCategory[active].slice(0, 4)}
              side="left"
              heroSrc={HERO_BY_CATEGORY[active]}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div>
          {CATEGORIES.map((cat, idx) => (
            <Fragment key={cat}>
              <MenuCategoryBlock
                category={cat}
                items={itemsByCategory[cat]}
                side={idx % 2 === 0 ? 'left' : 'right'}
                heroSrc={HERO_BY_CATEGORY[cat]}
              />
              {idx < CATEGORIES.length - 1 && (
                <div className="section-divider">
                  <span className="line" />
                  <span className="dot" />
                  <span className="line" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}

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
    </section>
  )
}
