import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SITE } from '../data/site'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
  tag?: string
}

type CartState = {
  items: CartItem[]
  add:    (item: Omit<CartItem, 'qty'>) => void
  inc:    (id: string) => void
  dec:    (id: string) => void
  remove: (id: string) => void
  clear:  () => void
  qty:    (id: string) => number
  count:  () => number
  subtotal: () => number
  tax: () => number
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id)
        if (existing) {
          return { items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
          ) }
        }
        return { items: [...state.items, { ...item, qty: 1 }] }
      }),

      inc: (id) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i),
      })),

      dec: (id) => set((state) => {
        const item = state.items.find((i) => i.id === id)
        if (!item) return state
        if (item.qty <= 1) {
          return { items: state.items.filter((i) => i.id !== id) }
        }
        return { items: state.items.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i) }
      }),

      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),

      qty: (id) => get().items.find((i) => i.id === id)?.qty ?? 0,

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      tax: () => Math.round(get().subtotal() * SITE.taxRate),

      total: () => get().subtotal() + get().tax(),
    }),
    {
      name: 'bheemasena:cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
