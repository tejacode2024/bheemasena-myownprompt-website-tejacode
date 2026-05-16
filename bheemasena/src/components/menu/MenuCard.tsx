import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Minus } from 'lucide-react'
import type { MenuItem } from '../../data/menu'
import { useCartStore } from '../../state/cartStore'
import { useUIStore } from '../../state/uiStore'
import { useConfigStore } from '../../state/configStore'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'
import { Tag } from '../ui/Tag'
import { formatPrice } from '../../lib/format'

type Props = { item: MenuItem }

export function MenuCard({ item }: Props) {
  const qty = useCartStore((s) => s.qty(item.id))
  const add = useCartStore((s) => s.add)
  const inc = useCartStore((s) => s.inc)
  const dec = useCartStore((s) => s.dec)
  const toast = useUIStore((s) => s.toast)
  const siteOnline    = useConfigStore((s) => s.siteOnline)
  const closedMessage = useConfigStore((s) => s.closedMessage)

  const [pulse, setPulse] = useState(0)

  const handleAdd = () => {
    if (!siteOnline) {
      toast(closedMessage, 'info')
      return
    }
    add({ id: item.id, name: item.name, price: item.price, tag: item.tag, image: item.image })
    toast('Added to cart', 'success')
    setPulse((p) => p + 1)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '92px 1fr',
        gap: 16,
        padding: 16,
        alignItems: 'center',
        borderBottom: '1px solid rgba(14,14,12,0.06)',
      }}
    >
      <div style={{ width: 92, height: 92 }}>
        <ImagePlaceholder aspect="1/1" label="dish" />
      </div>

      <div style={{ minWidth: 0, paddingRight: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h5 style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 400,
            color: 'var(--color-ink)',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{item.name}</h5>
          <div
            aria-hidden="true"
            style={{
              flex: 1,
              borderBottom: '1px dotted rgba(14,14,12,0.20)',
              margin: '0 8px',
              transform: 'translateY(-4px)',
            }}
          />
          <span style={{ fontSize: 14, color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>
            {formatPrice(item.price)}
          </span>
        </div>

        <p style={{
          marginTop: 6, marginBottom: 0,
          fontSize: 12, lineHeight: 1.6,
          color: 'var(--color-muted)',
          textTransform: 'none',
        }}>
          {item.description}
        </p>

        {item.tag && (
          <div style={{ marginTop: 8 }}>
            <Tag tag={item.tag} />
          </div>
        )}
      </div>

      {qty === 0 ? (
        <motion.button
          key={`add-${pulse}`}
          type="button"
          className="plus-btn"
          aria-label={`Add ${item.name} to cart`}
          onClick={handleAdd}
          animate={{ scale: [1, 0.85, 1] }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Plus size={16} strokeWidth={2} />
        </motion.button>
      ) : (
        <div className="qty-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
          <button type="button" aria-label="Decrease" onClick={() => dec(item.id)}>
            <Minus size={12} />
          </button>
          <span>{qty}</span>
          <button type="button" aria-label="Increase" onClick={() => inc(item.id)}>
            <Plus size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
