const API = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const H = (secret: string): HeadersInit => ({
  'Content-Type': 'application/json',
  'x-admin-secret': secret,
})

async function jsonOrThrow(r: Response): Promise<any> {
  if (!r.ok) {
    let msg = `${r.status}`
    try { const j = await r.json(); if (j?.error) msg = j.error } catch { /* ignore */ }
    throw new Error(msg)
  }
  return r.json()
}

export const api = {
  // ── Config ──
  fetchConfig: () =>
    fetch(`${API}/api/config`).then(jsonOrThrow),
  patchConfig: (update: object, secret: string) =>
    fetch(`${API}/api/config`, { method: 'PATCH', headers: H(secret), body: JSON.stringify(update) }).then(jsonOrThrow),

  // ── Orders ──
  fetchOrders: (secret: string) =>
    fetch(`${API}/api/orders`, { headers: H(secret) }).then(jsonOrThrow),
  fetchArchivedOrders: (secret: string) =>
    fetch(`${API}/api/orders?archived=true`, { headers: H(secret) }).then(jsonOrThrow),
  patchOrder: (id: string | number, body: object, secret: string) =>
    fetch(`${API}/api/orders?id=${id}`, { method: 'PATCH', headers: H(secret), body: JSON.stringify(body) }).then(jsonOrThrow),
  deleteOrder: (id: string | number, secret: string) =>
    fetch(`${API}/api/orders?id=${id}`, { method: 'DELETE', headers: H(secret) }).then(jsonOrThrow),
  clearAllOrders: (secret: string) =>
    fetch(`${API}/api/orders`, { method: 'DELETE', headers: H(secret) }).then(jsonOrThrow),
  exportXLSX: (secret: string) =>
    fetch(`${API}/api/export`, { headers: H(secret) }),

  // ── Menu ──
  fetchMenu: () =>
    fetch(`${API}/api/menu`).then(jsonOrThrow),
  addMenuItem: (body: object, secret: string) =>
    fetch(`${API}/api/menu`, { method: 'POST', headers: H(secret), body: JSON.stringify(body) }).then(jsonOrThrow),
  patchMenuItem: (id: number, body: object, secret: string) =>
    fetch(`${API}/api/menu?id=${id}`, { method: 'PATCH', headers: H(secret), body: JSON.stringify(body) }).then(jsonOrThrow),
  deleteMenuItem: (id: number, secret: string) =>
    fetch(`${API}/api/menu?id=${id}`, { method: 'DELETE', headers: H(secret) }).then(jsonOrThrow),
}

export type RawOrder = {
  id: number
  token_number: number
  customer_name: string
  customer_phone: string
  items: Array<{ name: string; qty: number }>
  payment_mode: string
  total: number
  pay_status: string
  pending_amount: number | null
  deliver_status: string
  session_type: 'lunch' | 'dinner'
  archived: boolean
  archived_at: string | null
  delivered_at: string | null
  created_at: string
}

export type ConfigRow = {
  id: number
  site_online: boolean
  /** Message shown to user-site customers when the site is offline
   *  and they try to add an item to the cart. */
  closed_message: string
  item_flags: Record<string, boolean>
  price_overrides: Record<string, number>
  original_price_overrides: Record<string, number>
  hidden_items: string[]
  category_headings: Record<string, { prefix: string; italic: string }>
  updated_at: string
}

export type DynamicMenuItem = {
  id: number
  category_key: string
  category_label: string
  category_heading: string | null
  name: string
  desc: string | null
  price: number
  original_price: number | null
  veg: boolean
  img: string | null
  created_at: string
}
