import { db, guard, readJSON } from './_db.js'

export default async function handler(req, res) {
  const supa = db()

  if (req.method === 'GET') {
    const { data, error } = await supa.from('config').select('*').eq('id', 1).single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    if (!guard(req, res)) return
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
    const patch = { ...body, updated_at: new Date().toISOString() }
    delete patch.id
    const { data, error } = await supa
      .from('config')
      .update(patch)
      .eq('id', 1)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ error: 'Method not allowed' })
}
