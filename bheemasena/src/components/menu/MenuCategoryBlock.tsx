import type { MenuItem } from '../../data/menu'
import { MediaPlaceholder } from '../ui/MediaPlaceholder'
import { MenuRow } from './MenuRow'

type Props = {
  category: string
  items: MenuItem[]
  side: 'left' | 'right'
  heroSrc?: string
}

export function MenuCategoryBlock({ category, items, side, heroSrc }: Props) {
  // On desktop, "side" controls which column the media sits in.
  // On mobile, media is always on top (handled in CSS via .menu-block flex order).
  const mediaOrder = side === 'left' ? 0 : 2

  return (
    <section
      aria-label={category}
      id={categoryAnchor(category)}
      className="menu-block"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(32px, 5vw, 80px)',
        alignItems: 'center',
        padding: 'clamp(48px, 6vw, 80px) 0',
      }}
    >
      <div className="menu-block-media" style={{ order: mediaOrder }}>
        <MediaPlaceholder
          aspect="4/5"
          src={heroSrc}
          type="auto"
          label={category.toLowerCase()}
          alt={category}
          rounded={0}
        />
      </div>

      <div className="menu-block-list" style={{ order: 1 }}>
        <h3 className="menu-cat-title">{category}</h3>
        <div className="menu-cat-divider" aria-hidden="true" />
        {items.length === 0 ? (
          <p
            style={{
              fontSize: 13, color: 'var(--color-muted)',
              textTransform: 'none', margin: '4px 0 0',
            }}
          >
            Items coming soon.
          </p>
        ) : (
          items.map((item, i) => <MenuRow key={item.id} item={item} index={i} />)
        )}
      </div>
    </section>
  )
}

export function categoryAnchor(category: string) {
  return 'menu-cat-' + category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
