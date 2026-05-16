import { db } from './_db.js'

// Vercel cron hits this at 00:30 IST and 08:30 IST (configured in vercel.json).
// Soft-archives every active order so the next session starts clean.
export default async function handler(_req, res) {
  const sql = db()
  try {
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
