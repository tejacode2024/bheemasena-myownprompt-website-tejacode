import { create } from 'zustand'

const DEFAULT_CLOSED_MESSAGE = 'The website is temporarily closed — come back soon.'

type ConfigState = {
  loaded: boolean
  siteOnline: boolean
  closedMessage: string
  /** Pull the latest config from /api/config — site_online and the
   *  customer-facing "we're closed" message. Silent on errors. */
  load: () => Promise<void>
}

export const useConfigStore = create<ConfigState>((set) => ({
  loaded: false,
  siteOnline: true,
  closedMessage: DEFAULT_CLOSED_MESSAGE,
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
      })
    } catch {
      // Silent — keep optimistic defaults so the menu still works
      // for the user when /api/config can't be reached.
      set({ loaded: true })
    }
  },
}))
