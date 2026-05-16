import { db, guard, readJSON } from './_db.js'

export default async function handler(req, res) {
  const sql = db()

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM config WHERE id = 1`
      if (rows.length === 0) {
        const [row] = await sql`INSERT INTO config (id) VALUES (1) RETURNING *`
        return res.status(200).json(row)
      }
      return res.status(200).json(rows[0])
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'PATCH') {
    if (!guard(req, res)) return
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }

    const allowed = ['site_online', 'item_flags', 'price_overrides',
                     'original_price_overrides', 'hidden_items', 'category_headings']
    const patch = {}
    for (const k of allowed) if (k in body) patch[k] = body[k]

    try {
      const [row] = await sql`
        UPDATE config SET
          site_online              = COALESCE(${patch.site_online ?? null}, site_online),
          item_flags               = COALESCE(${patch.item_flags ?? null}::jsonb, item_flags),
          price_overrides          = COALESCE(${patch.price_overrides ?? null}::jsonb, price_overrides),
          original_price_overrides = COALESCE(${patch.original_price_overrides ?? null}::jsonb, original_price_overrides),
          hidden_items             = COALESCE(${patch.hidden_items ?? null}::jsonb, hidden_items),
          category_headings        = COALESCE(${patch.category_headings ?? null}::jsonb, category_headings),
          updated_at               = NOW()
        WHERE id = 1
        RETURNING *
      `
      return res.status(200).json(row)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ error: 'Method not allowed' })
}
