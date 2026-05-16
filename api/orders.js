import { db, guard, readJSON, sessionType } from './_db.js'

async function autoPurge(supa) {
  const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  await supa.from('orders').delete().eq('archived', true).lt('archived_at', cutoff)
}

export default async function handler(req, res) {
  const supa = db()
  autoPurge(supa).catch(() => {})

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const id   = url.searchParams.get('id')
  const phone = url.searchParams.get('phone')
  const archivedFlag = url.searchParams.get('archived')

  // ── POST: place a new order ──────────────────────────
  if (req.method === 'POST') {
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const { customer_name, customer_phone, items, payment_mode, total } = body
    if (!customer_name || !customer_phone || !Array.isArray(items) || typeof total !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const { data: tokenData, error: tokenErr } = await supa.rpc('next_order_token')
    if (tokenErr) return res.status(500).json({ error: tokenErr.message })
    const token = Number(tokenData)
    const { data, error } = await supa.from('orders').insert({
      token_number: token,
      customer_name, customer_phone,
      items,
      payment_mode: payment_mode || 'cod',
      total,
      session_type: sessionType(),
    }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ orderId: token, row: data })
  }

  // ── GET ──────────────────────────────────────────────
  if (req.method === 'GET') {
    if (phone) {
      const { data, error } = await supa
        .from('orders').select('*').eq('customer_phone', phone)
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }
    if (archivedFlag === 'true') {
      if (!guard(req, res)) return
      const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
      const { data, error } = await supa
        .from('orders').select('*')
        .eq('archived', true).gte('archived_at', cutoff)
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }
    if (!guard(req, res)) return
    const { data, error } = await supa
      .from('orders').select('*').eq('archived', false)
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // ── PATCH /api/orders?id=TOKEN ───────────────────────
  if (req.method === 'PATCH') {
    if (!guard(req, res)) return
    if (!id) return res.status(400).json({ error: 'Missing id' })
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const allowed = ['items', 'total', 'deliver_status', 'pay_status', 'pending_amount']
    const patch = {}
    for (const k of allowed) if (k in body) patch[k] = body[k]
    if (patch.deliver_status === 'delivered') patch.delivered_at = new Date().toISOString()
    const { data, error } = await supa
      .from('orders').update(patch)
      .eq('token_number', Number(id))
      .select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // ── DELETE ───────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!guard(req, res)) return
    if (id) {
      const { error } = await supa.from('orders').delete().eq('token_number', Number(id))
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }
    // Bulk: archive all active orders
    const { data, error } = await supa
      .from('orders').update({ archived: true, archived_at: new Date().toISOString() })
      .eq('archived', false).select('id')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ archived: data?.length ?? 0 })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
