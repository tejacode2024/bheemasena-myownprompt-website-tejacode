import { db, guard, readJSON } from './_db.js'

export default async function handler(req, res) {
  const supa = db()
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const id = url.searchParams.get('id')

  if (req.method === 'GET') {
    const { data, error } = await supa
      .from('menu_items').select('*').order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    if (!guard(req, res)) return
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const insert = {
      category_key:     body.category_key,
      category_label:   body.category_label,
      category_heading: body.category_heading ?? null,
      name:             body.name,
      desc:             body.desc ?? null,
      price:            Number(body.price),
      original_price:   body.original_price == null ? null : Number(body.original_price),
      veg:              !!body.veg,
      img:              body.img ?? null,
    }
    if (!insert.category_key || !insert.category_label || !insert.name || !insert.price) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const { data, error } = await supa.from('menu_items').insert(insert).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PATCH') {
    if (!guard(req, res)) return
    if (!id) return res.status(400).json({ error: 'Missing id' })
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const allowed = ['price', 'original_price', 'desc', 'category_heading']
    const patch = {}
    for (const k of allowed) if (k in body) patch[k] = body[k]
    if ('price' in patch && patch.price != null) patch.price = Number(patch.price)
    if ('original_price' in patch && patch.original_price != null) patch.original_price = Number(patch.original_price)
    const { data, error } = await supa
      .from('menu_items').update(patch).eq('id', Number(id))
      .select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    if (!guard(req, res)) return
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await supa.from('menu_items').delete().eq('id', Number(id))
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
