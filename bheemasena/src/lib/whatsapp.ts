import { SITE } from '../data/site'

export type ReservePayload = {
  name: string
  party: number
  date: string
  time: string
  note?: string
}

export function buildWhatsAppReserveLink(p: ReservePayload): string {
  const lines = [
    `Hello Bheemasena, I'd like to reserve a table.`,
    `Name: ${p.name}`,
    `Party: ${p.party}`,
    `When: ${p.date} at ${p.time}`,
    p.note ? `Note: ${p.note}` : null,
  ].filter(Boolean)
  const text = encodeURIComponent(lines.join('\n'))
  const num  = SITE.phoneE164.replace(/\D/g, '')
  return `https://wa.me/${num}?text=${text}`
}
