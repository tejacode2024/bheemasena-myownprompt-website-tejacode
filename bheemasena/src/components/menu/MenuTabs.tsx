import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

type Props = {
  active: string
  onChange: (c: string) => void
  categories: readonly string[]
  /** Opt-in mobile pill restyle. Set true only on the landing
   *  preview; defaults to false so /menu keeps the original
   *  underline tabs on every viewport. */
  mobilePills?: boolean
}

export function MenuTabs({ active, onChange, categories, mobilePills = false }: Props) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768,
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ─── Mobile pills (opt-in via `mobilePills` from the landing preview) ───
  if (isMobile && mobilePills) {
    return (
      <div
        role="tablist"
        aria-label="Menu categories"
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '4px 16px 20px',
          marginBottom: 16,
          // Snap so the user feels each pill click out cleanly when scrolling.
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((cat) => {
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
                flexShrink: 0,
                padding: '10px 18px',
                minHeight: 40,
                borderRadius: 999,
                fontFamily: 'inherit',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                scrollSnapAlign: 'center',
                transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                ...(isActive
                  ? {
                      background: 'var(--color-ink)',
                      color: 'var(--color-cream)',
                      border: '1px solid var(--color-ink)',
                      boxShadow: '0 6px 16px rgba(14,14,12,0.18)',
                    }
                  : {
                      background: 'var(--color-cream)',
                      color: 'var(--color-ink-soft)',
                      border: '1px solid rgba(14,14,12,0.08)',
                    }
                ),
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>
    )
  }

  // ─── Desktop: original underline-tabs layout (unchanged) ───
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
      {categories.map((cat) => {
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
