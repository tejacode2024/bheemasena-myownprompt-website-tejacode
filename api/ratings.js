import { db, readJSON } from './_db.js'

export default async function handler(req, res) {
  const supa = db()
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET') {
    const itemId = url.searchParams.get('item_id')
    if (!itemId) return res.status(400).json({ error: 'Missing item_id' })
    const { data, error } = await supa
      .from('ratings').select('rating').eq('item_id', itemId)
    if (error) return res.status(500).json({ error: error.message })
    const count = data.length
    const avg = count === 0 ? 0 : data.reduce((s, r) => s + r.rating, 0) / count
    return res.status(200).json({ count, avg: Number(avg.toFixed(2)) })
  }

  if (req.method === 'POST') {
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const { order_token, phone, item_id, rating } = body
    if (!order_token || !phone || !item_id || !rating) return res.status(400).json({ error: 'Missing fields' })
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating out of range' })
    const { error } = await supa.from('ratings').insert({ order_token, phone, item_id, rating })
    if (error) {
      if (String(error.message).includes('duplicate')) return res.status(409).json({ error: 'Already rated' })
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
