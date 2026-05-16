import { SITE } from '../data/site'

export function formatPrice(amount: number): string {
  return `${SITE.currencySymbol}${amount}`
}

export function formatDayLabel(ts: number): string {
  const d = new Date(ts)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  }).format(d)
}

export function formatDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
}

export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
