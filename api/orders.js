import { db, guard, readJSON, sessionType } from './_db.js'

async function autoPurge(sql) {
  const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  await sql`DELETE FROM orders WHERE archived = true AND archived_at < ${cutoff}`
}

export default async function handler(req, res) {
  const sql = db()
  autoPurge(sql).catch(() => {})

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const id = url.searchParams.get('id')
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
    try {
      const tokenRows = await sql`SELECT next_order_token() AS t`
      const token = Number(tokenRows[0].t)
      const [row] = await sql`
        INSERT INTO orders
          (token_number, customer_name, customer_phone, items, payment_mode, total, session_type)
        VALUES
          (${token}, ${customer_name}, ${customer_phone}, ${JSON.stringify(items)}::jsonb,
           ${payment_mode || 'cod'}, ${total}, ${sessionType()})
        RETURNING *
      `
      return res.status(201).json({ orderId: token, row })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── GET ──────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      if (phone) {
        const rows = await sql`
          SELECT * FROM orders
          WHERE customer_phone = ${phone}
          ORDER BY created_at DESC
        `
        return res.status(200).json(rows)
      }
      if (archivedFlag === 'true') {
        if (!guard(req, res)) return
        const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
        const rows = await sql`
          SELECT * FROM orders
          WHERE archived = true AND archived_at >= ${cutoff}
          ORDER BY created_at DESC
        `
        return res.status(200).json(rows)
      }
      if (!guard(req, res)) return
      const rows = await sql`
        SELECT * FROM orders
        WHERE archived = false
        ORDER BY created_at DESC
      `
      return res.status(200).json(rows)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
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

    try {
      const itemsArg     = 'items' in patch          ? JSON.stringify(patch.items) : null
      const totalArg     = 'total' in patch          ? patch.total                  : null
      const deliverArg   = 'deliver_status' in patch ? patch.deliver_status         : null
      const payArg       = 'pay_status' in patch     ? patch.pay_status             : null
      const pendingArg   = 'pending_amount' in patch ? patch.pending_amount         : null
      const deliveredAtArg = patch.delivered_at ?? null

      const [row] = await sql`
        UPDATE orders SET
          items           = COALESCE(${itemsArg}::jsonb, items),
          total           = COALESCE(${totalArg}::int, total),
          deliver_status  = COALESCE(${deliverArg}, deliver_status),
          pay_status      = COALESCE(${payArg}, pay_status),
          pending_amount  = CASE WHEN ${'pending_amount' in patch} THEN ${pendingArg}::int ELSE pending_amount END,
          delivered_at    = COALESCE(${deliveredAtArg}::timestamptz, delivered_at)
        WHERE token_number = ${Number(id)}
        RETURNING *
      `
      if (!row) return res.status(404).json({ error: 'Order not found' })
      return res.status(200).json(row)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── DELETE ───────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!guard(req, res)) return
    try {
      if (id) {
        await sql`DELETE FROM orders WHERE token_number = ${Number(id)}`
        return res.status(200).json({ ok: true })
      }
      // Bulk: archive all active orders
      const rows = await sql`
        UPDATE orders
        SET archived = true, archived_at = NOW()
        WHERE archived = false
        RETURNING id
      `
      return res.status(200).json({ archived: rows.length })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
