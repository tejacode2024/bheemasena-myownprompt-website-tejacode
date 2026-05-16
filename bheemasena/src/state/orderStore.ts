import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from './cartStore'

export type AddressData = {
  fullName: string
  phone: string
  flat: string
  street: string
  landmark?: string
  city: string
  pincode: string
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
  place: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order
}

function genOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `BHM-${s}`
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (draft) => {
        const order: Order = {
          ...draft,
          id: genOrderId(),
          createdAt: Date.now(),
          status: 'PLACED',
        }
        set({ orders: [order, ...get().orders] })
        return order
      },
    }),
    {
      name: 'bheemasena:orders',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
