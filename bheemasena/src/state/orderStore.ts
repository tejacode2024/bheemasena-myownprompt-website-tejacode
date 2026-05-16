import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from './cartStore'

export type AddressData = {
  fullName: string
  phone: string
  /** Free-form delivery address — everything the rider needs in one box. */
  address: string
  // Legacy fields preserved for back-compat with orders persisted before
  // we switched to the single-textarea address. Newly placed orders
  // leave these undefined; old orders may still have them.
  flat?: string
  street?: string
  landmark?: string
  city?: string
  pincode?: string
}

/** Render an address as a single display string, handling both the
 *  new single-textarea shape and the legacy multi-field shape. */
export function addressDisplay(a: AddressData): string {
  if (a.address && a.address.trim()) return a.address
  return [a.flat, a.street, a.landmark, a.city, a.pincode]
    .filter(Boolean).join(', ')
}

export type Order = {
  id: string
  createdAt: number
  items: CartItem[]
  address: AddressData
  payment: 'COD'
  subtotal: number
  tax: number
  total: number
  status: 'PLACED'
}

type OrderState = {
  orders: Order[]
  lastOrder: Order | null
  place: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>
}

function genOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `BHM-${s}`
}

async function postToBackend(order: Order): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: order.address.fullName,
        customer_phone: order.address.phone,
        items: order.items.map((i) => ({ name: i.name, qty: i.qty })),
        payment_mode: order.payment === 'COD' ? 'cod' : 'prepaid',
        total: order.total,
      }),
    })
  } catch {
    // Silent — the local order still works even if the backend is unreachable.
  }
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      lastOrder: null,
      place: async (draft) => {
        const order: Order = {
          ...draft,
          id: genOrderId(),
          createdAt: Date.now(),
          status: 'PLACED',
        }
        set({ orders: [order, ...get().orders], lastOrder: order })
        await postToBackend(order)
        return order
      },
    }),
    {
      name: 'bheemasena:orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ orders: s.orders, lastOrder: s.lastOrder }),
    },
  ),
)
