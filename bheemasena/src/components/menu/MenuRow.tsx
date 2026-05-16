import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Minus } from 'lucide-react'
import type { MenuItem } from '../../data/menu'
import { useCartStore } from '../../state/cartStore'
import { useUIStore } from '../../state/uiStore'
import { Tag } from '../ui/Tag'
import { formatPrice } from '../../lib/format'

type Props = { item: MenuItem; index?: number }

export function MenuRow({ item, index = 0 }: Props) {
  const qty   = useCartStore((s) => s.qty(item.id))
  const add   = useCartStore((s) => s.add)
  const inc   = useCartStore((s) => s.inc)
  const dec   = useCartStore((s) => s.dec)
  const toast = useUIStore((s) => s.toast)
  const [pulse, setPulse] = useState(0)

  const handleAdd = () => {
    add({ id: item.id, name: item.name, price: item.price, tag: item.tag, image: item.image })
    toast('Added to cart', 'success')
    setPulse((p) => p + 1)
  }

  return (
    <motion.div
      className="menu-row"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
    >
      <div className="menu-row-top">
        <h5 className="menu-row-name">{item.name}</h5>
        <span aria-hidden="true" className="menu-row-leader" />
        <span className="menu-row-price">{formatPrice(item.price)}</span>
      </div>

      <p className="menu-row-desc">{item.description}</p>

      {item.tag && (
        <div style={{ marginTop: 10 }}>
          <Tag tag={item.tag} />
        </div>
      )}

      {qty === 0 ? (
        <motion.button
          key={`add-${pulse}`}
          type="button"
          className="plus-btn menu-row-plus"
          aria-label={`Add ${item.name} to cart`}
          onClick={handleAdd}
          animate={{ scale: [1, 0.85, 1] }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Plus size={16} strokeWidth={2} />
        </motion.button>
      ) : (
        <div className="qty-stepper menu-row-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
          <button type="button" aria-label="Decrease" onClick={() => dec(item.id)}>
            <Minus size={12} />
          </button>
          <span>{qty}</span>
          <button type="button" aria-label="Increase" onClick={() => inc(item.id)}>
            <Plus size={12} />
          </button>
        </div>
      )}
    </motion.div>
  )
}
