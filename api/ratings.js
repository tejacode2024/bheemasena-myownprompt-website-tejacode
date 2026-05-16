import { db, readJSON } from './_db.js'

export default async function handler(req, res) {
  const sql = db()
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET') {
    const itemId = url.searchParams.get('item_id')
    if (!itemId) return res.status(400).json({ error: 'Missing item_id' })
    try {
      const rows = await sql`
        SELECT rating FROM ratings WHERE item_id = ${itemId}
      `
      const count = rows.length
      const avg = count === 0 ? 0 : rows.reduce((s, r) => s + r.rating, 0) / count
      return res.status(200).json({ count, avg: Number(avg.toFixed(2)) })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'POST') {
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const { order_token, phone, item_id, rating } = body
    if (!order_token || !phone || !item_id || !rating) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating out of range' })
    try {
      await sql`
        INSERT INTO ratings (order_token, phone, item_id, rating)
        VALUES (${order_token}, ${phone}, ${item_id}, ${rating})
      `
      return res.status(201).json({ ok: true })
    } catch (e) {
      if (String(e.message).includes('duplicate') || e.code === '23505') {
        return res.status(409).json({ error: 'Already rated' })
      }
      return res.status(500).json({ error: e.message })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
