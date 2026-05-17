import { create } from 'zustand'

const DEFAULT_CLOSED_MESSAGE = 'The website is temporarily closed — come back soon.'

type ConfigState = {
  loaded: boolean
  siteOnline: boolean
  closedMessage: string
  /** Per-item availability map. If `item_flags[itemId] === false`, the
   *  item is admin-disabled and the + button should be hidden. Items
   *  not present in the map default to enabled. */
  itemFlags: Record<string, boolean>
  /** Item IDs the admin has hidden entirely — they should be filtered
   *  out of the menu before render. */
  hiddenItems: string[]
  /** Pull the latest config from /api/config. Silent on errors. */
  load: () => Promise<void>
  /** Convenience: returns true if this item is enabled (default) or
   *  unset; false only when the admin has explicitly disabled it. */
  isItemEnabled: (id: string) => boolean
  /** Convenience: returns true if this item has been completely hidden
   *  from the menu by the admin. */
  isItemHidden: (id: string) => boolean
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  loaded: false,
  siteOnline: true,
  closedMessage: DEFAULT_CLOSED_MESSAGE,
  itemFlags: {},
  hiddenItems: [],
  load: async () => {
    try {
      const r = await fetch('/api/config')
      if (!r.ok) throw new Error(String(r.status))
      const data = await r.json()
      set({
        loaded: true,
        siteOnline: data.site_online !== false,
        closedMessage: (typeof data.closed_message === 'string' && data.closed_message.trim())
          ? data.closed_message
          : DEFAULT_CLOSED_MESSAGE,
        itemFlags: (data.item_flags && typeof data.item_flags === 'object')
          ? data.item_flags
          : {},
        hiddenItems: Array.isArray(data.hidden_items) ? data.hidden_items : [],
      })
    } catch {
      // Silent — keep optimistic defaults so the menu still works
      // for the user when /api/config can't be reached.
      set({ loaded: true })
    }
  },
  isItemEnabled: (id) => get().itemFlags[id] !== false,
  isItemHidden:  (id) => get().hiddenItems.includes(id),
}))
