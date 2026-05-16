import { motion } from 'motion/react'
import { MENU_CATEGORIES, type MenuCategory } from '../../data/menu'

type Props = {
  active: MenuCategory
  onChange: (c: MenuCategory) => void
}

export function MenuTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className="scrollbar-hide"
      style={{
        display: 'flex',
        gap: 28,
        justifyContent: 'center',
        overflowX: 'auto',
        marginBottom: 40,
      }}
    >
      {MENU_CATEGORIES.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            style={{
              position: 'relative',
              padding: '8px 4px',
              fontSize: 13, letterSpacing: '0.14em',
              color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 0.25s ease',
            }}
          >
            {cat}
            {isActive && (
              <motion.div
                layoutId="menu-underline"
                style={{
                  position: 'absolute',
                  left: 0, right: 0, bottom: 0,
                  height: 2,
                  background: 'var(--color-accent)',
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
