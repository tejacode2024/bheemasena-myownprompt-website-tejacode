import { create } from 'zustand'
import type { AddressData } from './orderStore'

export type CartStep = 'cart' | 'confirmation'
export type ToastTone = 'info' | 'success' | 'error'
export type Toast = { id: string; message: string; tone: ToastTone }

export type OrderDraft = {
  address: AddressData
  payment: 'COD'
}

type UIState = {
  cartOpen: boolean
  cartStep: CartStep
  reserveOpen: boolean
  toasts: Toast[]
  lang: 'en' | 'fr'
  addressDraft: AddressData | null
  lastOrderId: string | null

  // Order timeline (full-viewport confirmation overlay)
  timelineOpen: boolean
  orderDraft: OrderDraft | null

  openCart: () => void
  closeCart: () => void
  setStep: (s: CartStep) => void
  openReserve: () => void
  closeReserve: () => void
  toast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
  toggleLang: () => void
  setAddressDraft: (a: AddressData | null) => void
  setLastOrderId: (id: string | null) => void

  openTimeline: (draft: OrderDraft) => void
  closeTimeline: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  cartOpen: false,
  cartStep: 'cart',
  reserveOpen: false,
  toasts: [],
  lang: 'en',
  addressDraft: null,
  lastOrderId: null,

  timelineOpen: false,
  orderDraft: null,

  openCart: () => set({ cartOpen: true, cartStep: get().cartStep === 'confirmation' ? 'cart' : get().cartStep }),
  closeCart: () => set({ cartOpen: false }),
  setStep: (s) => set({ cartStep: s }),

  openReserve: () => set({ reserveOpen: true }),
  closeReserve: () => set({ reserveOpen: false }),

  toast: (message, tone = 'info') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set({ toasts: [...get().toasts, { id, message, tone }] })
    setTimeout(() => get().dismissToast(id), 3200)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  toggleLang: () => set({ lang: get().lang === 'en' ? 'fr' : 'en' }),
  setAddressDraft: (a) => set({ addressDraft: a }),
  setLastOrderId: (id) => set({ lastOrderId: id }),

  openTimeline: (draft) => set({ orderDraft: draft, timelineOpen: true, cartOpen: false }),
  closeTimeline: () => set({ timelineOpen: false }),
}))
