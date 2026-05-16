import { create } from 'zustand'
import { api } from '../lib/api'
import type { RawOrder } from '../lib/api'

type OrdersState = {
  orders: RawOrder[]
  loading: boolean
  lastFetch: number
  setOrders: (o: RawOrder[]) => void
  mergeOrders: (fresh: RawOrder[]) => void
  load: (secret: string) => Promise<RawOrder[]>
  patchLocal: (token: number, patch: Partial<RawOrder>) => void
  removeLocal: (token: number) => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  lastFetch: 0,

  setOrders: (o) => set({ orders: o, lastFetch: Date.now() }),

  mergeOrders: (fresh) => {
    const map = new Map<number, RawOrder>()
    for (const cur of get().orders) map.set(cur.token_number, cur)
    for (const f of fresh) {
      const existing = map.get(f.token_number)
      if (!existing) {
        map.set(f.token_number, f)
        continue
      }
      if (f.deliver_status === 'delivered' && existing.deliver_status !== 'delivered') {
        map.set(f.token_number, { ...existing, ...f })
        continue
      }
      map.set(f.token_number, { ...f, deliver_status: existing.deliver_status === 'delivered' ? 'delivered' : f.deliver_status })
    }
    const merged = Array.from(map.values()).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    set({ orders: merged, lastFetch: Date.now() })
  },

  load: async (secret: string) => {
    if (!secret) return []
    set({ loading: true })
    try {
      const fresh: RawOrder[] = await api.fetchOrders(secret)
      const current = get().orders
      if (current.length === 0) {
        set({ orders: fresh, loading: false, lastFetch: Date.now() })
      } else {
        get().mergeOrders(fresh)
        set({ loading: false })
      }
      return fresh
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  patchLocal: (token, patch) => {
    set({
      orders: get().orders.map(o =>
        o.token_number === token ? { ...o, ...patch } : o,
      ),
    })
  },

  removeLocal: (token) => {
    set({ orders: get().orders.filter(o => o.token_number !== token) })
  },
}))
