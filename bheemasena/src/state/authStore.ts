import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AuthUser = {
  id: string
  name: string
  email: string
  initials: string
}

type AuthState = {
  user: AuthUser | null
  mode: 'authed' | 'guest' | null
  signInWithGoogle: () => Promise<void>
  setGuest: () => void
  logout: () => void
  isAuthenticated: () => boolean
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      mode: null,

      // TODO: replace with real Google OAuth (Firebase / Auth.js / Supabase)
      signInWithGoogle: async () => {
        await new Promise((r) => setTimeout(r, 400))
        const name = 'Demo User'
        set({
          user: { id: 'usr_demo', name, email: 'demo@bheemasena.io', initials: computeInitials(name) },
          mode: 'authed',
        })
      },

      setGuest: () => set({ user: null, mode: 'guest' }),

      logout: () => set({ user: null, mode: null }),

      isAuthenticated: () => get().mode === 'authed' && !!get().user,
    }),
    {
      name: 'bheemasena:auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
