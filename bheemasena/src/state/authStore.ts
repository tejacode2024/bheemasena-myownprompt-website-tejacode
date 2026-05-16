import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type User = {
  id: string
  name: string
  email: string
  phone: string
}

// Legacy alias — older components still import { AuthUser }.
export type AuthUser = User

export type AuthMode = 'unauthenticated' | 'guest' | 'authenticated'

type AuthState = {
  user: User | null
  mode: AuthMode
  isAuthenticated: boolean

  setUser: (u: User) => void
  setGuest: () => void
  logout: () => void

  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<{ isNewUser: boolean }>
  setPassword: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, phone: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
}

async function postAuth(action: string, payload: object): Promise<any> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      mode: 'unauthenticated',
      isAuthenticated: false,

      setUser: (u) => set({ user: u, mode: 'authenticated', isAuthenticated: true }),
      setGuest: () => set({ user: null, mode: 'guest', isAuthenticated: false }),
      logout: () => {
        set({ user: null, mode: 'unauthenticated', isAuthenticated: false })
        try { localStorage.removeItem('bhm:user') } catch { /* ignore */ }
      },

      sendOtp: async (email) => {
        await postAuth('send-otp', { email })
      },

      verifyOtp: async (email, otp) => {
        const data = await postAuth('verify-otp', { email, otp })
        return { isNewUser: !!data.isNewUser }
      },

      setPassword: async (email, password) => {
        await postAuth('set-password', { email, password })
      },

      register: async (email, name, phone, password) => {
        const data = await postAuth('register', { email, name, phone, password })
        if (data?.user) {
          set({ user: data.user, mode: 'authenticated', isAuthenticated: true })
        }
      },

      login: async (email, password) => {
        const data = await postAuth('login', { email, password })
        if (data?.user) {
          set({ user: data.user, mode: 'authenticated', isAuthenticated: true })
        }
      },
    }),
    {
      name: 'bhm:user',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, mode: s.mode, isAuthenticated: s.isAuthenticated }),
    },
  ),
)
