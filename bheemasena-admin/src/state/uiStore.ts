import { create } from 'zustand'

export type AdminTab =
  | 'overview' | 'menu-items'
  | 'lunch' | 'dinner' | 'past-orders' | 'showoff'

export type ToastTone = 'success' | 'error' | 'info' | 'new-order'

export type Toast = {
  id: string
  msg: string
  tone: ToastTone
}

type UIState = {
  tab: AdminTab
  sidebarOpen: boolean
  toasts: Toast[]
  newOrderInfo: { name: string; count: number } | null
  setTab: (t: AdminTab) => void
  setSidebarOpen: (v: boolean) => void
  addToast: (msg: string, tone?: ToastTone) => void
  removeToast: (id: string) => void
  setNewOrderInfo: (info: { name: string; count: number }) => void
  clearNewOrderInfo: () => void
}

let _tid = 0

export const useUIStore = create<UIState>((set, get) => ({
  tab: 'overview',
  sidebarOpen: false,
  toasts: [],
  newOrderInfo: null,

  setTab: (t) => set({ tab: t, sidebarOpen: false }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  addToast: (msg, tone = 'info') => {
    const id = `t${++_tid}`
    set({ toasts: [...get().toasts, { id, msg, tone }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter(t => t.id !== id) })
    }, tone === 'new-order' ? 6000 : 3000)
  },

  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),

  setNewOrderInfo: (info) => {
    set({ newOrderInfo: info })
    setTimeout(() => {
      if (get().newOrderInfo?.name === info.name) set({ newOrderInfo: null })
    }, 6000)
  },
  clearNewOrderInfo: () => set({ newOrderInfo: null }),
}))
