import { db, readJSON } from './_db.js'

// Light auth helpers — phone-based user lookup and creation for the user site.
// Email-OTP is stored but the actual send is intentionally stubbed; wire nodemailer + SMTP creds when ready.
export default async function handler(req, res) {
  const sql = db()
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const action = url.searchParams.get('action')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body
  try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }

  try {
    if (action === 'find-or-create') {
      const { name, phone, email } = body
      if (!name || !phone) return res.status(400).json({ error: 'Missing name/phone' })
      const existing = await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`
      if (existing.length > 0) return res.status(200).json({ user: existing[0], created: false })
      const [user] = await sql`
        INSERT INTO users (name, phone, email)
        VALUES (${name}, ${phone}, ${email ?? null})
        RETURNING *
      `
      return res.status(201).json({ user, created: true })
    }

    if (action === 'send-otp') {
      // TODO: wire nodemailer with SMTP creds. Stores OTP but does not actually send.
      const { email } = body
      if (!email) return res.status(400).json({ error: 'Missing email' })
      const otp = String(Math.floor(100000 + Math.random() * 900000))
      const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      await sql`
        INSERT INTO otp_store (email, otp, expires_at, created_at)
        VALUES (${email}, ${otp}, ${expires_at}, NOW())
        ON CONFLICT (email) DO UPDATE
          SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, created_at = NOW()
      `
      return res.status(200).json({ ok: true })
    }

    if (action === 'verify-otp') {
      const { email, otp } = body
      if (!email || !otp) return res.status(400).json({ error: 'Missing email/otp' })
      const rows = await sql`SELECT * FROM otp_store WHERE email = ${email} LIMIT 1`
      if (rows.length === 0) return res.status(404).json({ error: 'No OTP issued' })
      const row = rows[0]
      if (new Date(row.expires_at) < new Date()) return res.status(410).json({ error: 'OTP expired' })
      if (row.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' })
      await sql`DELETE FROM otp_store WHERE email = ${email}`
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
