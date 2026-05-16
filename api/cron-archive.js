import { db } from './_db.js'

// Vercel cron hits this at 00:30 IST and 08:30 IST (configured in vercel.json).
// Soft-archives every active order so the next session starts clean.
export default async function handler(req, res) {
  const supa = db()
  const { data, error } = await supa
    .from('orders')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('archived', false)
    .select('id')
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ archived: data?.length ?? 0 })
}
