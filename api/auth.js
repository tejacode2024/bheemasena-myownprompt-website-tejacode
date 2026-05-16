import { db, readJSON } from './_db.js'

// Light auth helpers — phone-based user lookup and creation for the user site.
// Email-OTP wiring is intentionally stubbed; swap in nodemailer + SMTP creds when ready.
export default async function handler(req, res) {
  const supa = db()
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const action = url.searchParams.get('action')

  if (req.method === 'POST') {
    let body
    try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }

    if (action === 'find-or-create') {
      const { name, phone, email } = body
      if (!name || !phone) return res.status(400).json({ error: 'Missing name/phone' })
      const existing = await supa.from('users').select('*').eq('phone', phone).maybeSingle()
      if (existing.data) return res.status(200).json({ user: existing.data, created: false })
      const { data, error } = await supa.from('users')
        .insert({ name, phone, email: email ?? null }).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ user: data, created: true })
    }

    if (action === 'send-otp') {
      // TODO: wire nodemailer with SMTP creds. Returns success without sending for now.
      const { email } = body
      if (!email) return res.status(400).json({ error: 'Missing email' })
      const otp = String(Math.floor(100000 + Math.random() * 900000))
      const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      const { error } = await supa.from('otp_store')
        .upsert({ email, otp, expires_at }, { onConflict: 'email' })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'verify-otp') {
      const { email, otp } = body
      if (!email || !otp) return res.status(400).json({ error: 'Missing email/otp' })
      const { data } = await supa.from('otp_store').select('*').eq('email', email).maybeSingle()
      if (!data) return res.status(404).json({ error: 'No OTP issued' })
      if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'OTP expired' })
      if (data.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' })
      await supa.from('otp_store').delete().eq('email', email)
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  res.setHeader('Allow', 'POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
