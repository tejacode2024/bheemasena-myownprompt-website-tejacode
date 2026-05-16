import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../lib/api'
import type { ConfigRow } from '../lib/api'

const DEFAULT_CLOSED_MESSAGE = 'The website is temporarily closed — come back soon.'

type AdminState = {
  authed: boolean
  secret: string
  siteOnline: boolean
  closedMessage: string
  itemFlags: Record<string, boolean>
  priceOverrides: Record<string, number>
  originalPriceOverrides: Record<string, number>
  hiddenItems: string[]
  categoryHeadings: Record<string, { prefix: string; italic: string }>
  saving: boolean
  statusMsg: string

  login: (pwd: string) => boolean
  logout: () => void
  setSiteOnline: (v: boolean) => void
  setClosedMessage: (msg: string) => void
  patchConfig: (update: Partial<ConfigRow>) => Promise<void>
  loadConfig: () => Promise<void>
  flash: (msg: string) => void
}

const EXPECTED_SECRET = (import.meta.env.VITE_ADMIN_SECRET as string | undefined) ?? 'bheemasena_admin_change_me'

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      authed: false,
      secret: '',
      siteOnline: true,
      closedMessage: DEFAULT_CLOSED_MESSAGE,
      itemFlags: {},
      priceOverrides: {},
      originalPriceOverrides: {},
      hiddenItems: [],
      categoryHeadings: {},
      saving: false,
      statusMsg: '',

      login: (pwd: string) => {
        if (pwd === EXPECTED_SECRET) {
          set({ authed: true, secret: pwd })
          return true
        }
        return false
      },
      logout: () => {
        set({ authed: false, secret: '' })
        try { sessionStorage.removeItem('bhm:admin') } catch { /* ignore */ }
      },
      setSiteOnline: (v: boolean) => set({ siteOnline: v }),
      setClosedMessage: (msg: string) => set({ closedMessage: msg }),

      patchConfig: async (update) => {
        const secret = get().secret
        if (!secret) return
        set({ saving: true })
        try {
          const next = await api.patchConfig(update, secret)
          set({
            siteOnline: !!next.site_online,
            closedMessage: next.closed_message ?? DEFAULT_CLOSED_MESSAGE,
            itemFlags: next.item_flags ?? {},
            priceOverrides: next.price_overrides ?? {},
            originalPriceOverrides: next.original_price_overrides ?? {},
            hiddenItems: Array.isArray(next.hidden_items) ? next.hidden_items : [],
            categoryHeadings: next.category_headings ?? {},
            saving: false,
            statusMsg: 'Saved',
          })
          setTimeout(() => set({ statusMsg: '' }), 2000)
        } catch (e: any) {
          set({ saving: false, statusMsg: 'Failed' })
          setTimeout(() => set({ statusMsg: '' }), 2000)
          throw e
        }
      },

      loadConfig: async () => {
        try {
          const cfg = await api.fetchConfig()
          set({
            siteOnline: !!cfg.site_online,
            closedMessage: cfg.closed_message ?? DEFAULT_CLOSED_MESSAGE,
            itemFlags: cfg.item_flags ?? {},
            priceOverrides: cfg.price_overrides ?? {},
            originalPriceOverrides: cfg.original_price_overrides ?? {},
            hiddenItems: Array.isArray(cfg.hidden_items) ? cfg.hidden_items : [],
            categoryHeadings: cfg.category_headings ?? {},
          })
        } catch { /* ignore — keep defaults */ }
      },

      flash: (msg: string) => {
        set({ statusMsg: msg })
        setTimeout(() => set({ statusMsg: '' }), 2000)
      },
    }),
    {
      name: 'bhm:admin',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ authed: s.authed, secret: s.secret }),
    },
  ),
)
