import { db, guard, readJSON } from './_db.js'

export default async function handler(req, res) {
  const sql = db()
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const id = url.searchParams.get('id')

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM menu_items ORDER BY created_at ASC`
      return res.status(200).json(rows)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'POST') {
    if (!guard(req, res)) return
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const {
      category_key, category_label, category_heading,
      name, desc, price, original_price, veg, img,
    } = body
    if (!category_key || !category_label || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    try {
      const [row] = await sql`
        INSERT INTO menu_items
          (category_key, category_label, category_heading, name, "desc",
           price, original_price, veg, img)
        VALUES
          (${category_key}, ${category_label}, ${category_heading ?? null},
           ${name}, ${desc ?? null}, ${Number(price)},
           ${original_price == null ? null : Number(original_price)},
           ${!!veg}, ${img ?? null})
        RETURNING *
      `
      return res.status(201).json(row)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'PATCH') {
    if (!guard(req, res)) return
    if (!id) return res.status(400).json({ error: 'Missing id' })
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }

    const priceArg    = 'price' in body          ? Number(body.price)          : null
    const originalArg = 'original_price' in body
      ? (body.original_price == null ? null : Number(body.original_price))
      : null
    const descArg     = 'desc' in body           ? body.desc                   : null
    const headingArg  = 'category_heading' in body ? body.category_heading     : null

    try {
      const [row] = await sql`
        UPDATE menu_items SET
          price            = COALESCE(${priceArg}::int, price),
          original_price   = CASE WHEN ${'original_price' in body} THEN ${originalArg}::int ELSE original_price END,
          "desc"           = CASE WHEN ${'desc' in body} THEN ${descArg} ELSE "desc" END,
          category_heading = CASE WHEN ${'category_heading' in body} THEN ${headingArg} ELSE category_heading END
        WHERE id = ${Number(id)}
        RETURNING *
      `
      if (!row) return res.status(404).json({ error: 'Item not found' })
      return res.status(200).json(row)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'DELETE') {
    if (!guard(req, res)) return
    if (!id) return res.status(400).json({ error: 'Missing id' })
    try {
      await sql`DELETE FROM menu_items WHERE id = ${Number(id)}`
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
