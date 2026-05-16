import { createHash } from 'node:crypto'
import nodemailer from 'nodemailer'
import { db, readJSON } from './_db.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const SALT = 'bheemasena_salt'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function hashPassword(pwd) {
  return createHash('sha256').update(SALT + pwd).digest('hex')
}

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function emailHtml(otp) {
  return `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#FBF8F3;border:1px solid rgba(14,14,12,0.08)">
  <h2 style="font-size:24px;color:#0E0E0C;margin:0 0 8px">Bheemasena</h2>
  <p style="font-size:12px;color:#6B655C;font-style:italic;margin:0 0 32px">Royal Feast</p>
  <p style="font-size:14px;color:#0E0E0C">Your one-time password is:</p>
  <p style="font-size:48px;font-weight:400;color:#8B6B3D;letter-spacing:0.15em;margin:16px 0">${otp}</p>
  <p style="font-size:12px;color:#6B655C">Valid for 10 minutes. Do not share this with anyone.</p>
</div>`
}

export default async function handler(req, res) {
  const sql = db()

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const email = (url.searchParams.get('email') || '').toLowerCase().trim()
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email' })
    }
    try {
      const rows = await sql`SELECT name, phone FROM users WHERE email = ${email} LIMIT 1`
      if (rows.length === 0) return res.status(200).json({ exists: false })
      const u = rows[0]
      return res.status(200).json({ exists: true, name: u.name, phone: u.phone })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body
  try { body = await readJSON(req) } catch { return res.status(400).json({ error: 'Bad JSON' }) }
  const action = body?.action

  try {
    // ── send-otp ──
    if (action === 'send-otp') {
      const email = (body.email || '').toLowerCase().trim()
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email.' })
      }
      const otp = genOtp()
      const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      await sql`
        INSERT INTO otp_store (email, otp, expires_at, created_at)
        VALUES (${email}, ${otp}, ${expires_at}, NOW())
        ON CONFLICT (email) DO UPDATE
          SET otp = EXCLUDED.otp,
              expires_at = EXCLUDED.expires_at,
              created_at = NOW()
      `
      await transporter.sendMail({
        from: `"Bheemasena 🏛" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Bheemasena OTP',
        html: `
          <div style="font-family:Georgia,serif;
            max-width:480px;margin:0 auto;padding:32px;
            background:#FBF8F3;border:1px solid
            rgba(14,14,12,0.08)">
            <h2 style="font-size:24px;color:#0E0E0C;
              margin:0 0 8px">Bheemasena</h2>
            <p style="font-size:12px;color:#6B655C;
              font-style:italic;margin:0 0 32px">
              Royal Feast</p>
            <p style="font-size:14px;color:#0E0E0C">
              Your one-time password is:</p>
            <p style="font-size:48px;font-weight:400;
              color:#8B6B3D;letter-spacing:0.15em;
              margin:16px 0">${otp}</p>
            <p style="font-size:12px;color:#6B655C">
              Valid for 10 minutes. Do not share
              this with anyone.</p>
          </div>
        `,
      })
      return res.status(200).json({ ok: true })
    }

    // ── verify-otp ──
    if (action === 'verify-otp') {
      const email = (body.email || '').toLowerCase().trim()
      const otp = String(body.otp || '').trim()
      if (!EMAIL_RE.test(email) || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required.' })
      }
      const rows = await sql`SELECT * FROM otp_store WHERE email = ${email} LIMIT 1`
      if (rows.length === 0) {
        return res.status(400).json({ error: 'OTP not found. Please request a new one.' })
      }
      const row = rows[0]
      if (new Date(row.expires_at) < new Date()) {
        await sql`DELETE FROM otp_store WHERE email = ${email}`
        return res.status(400).json({ error: 'OTP expired. Please request a new one.' })
      }
      if (String(row.otp) !== otp) {
        return res.status(400).json({ error: 'Incorrect OTP. Please try again.' })
      }
      await sql`DELETE FROM otp_store WHERE email = ${email}`
      const userRows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
      const isNewUser = userRows.length === 0
      return res.status(200).json({ ok: true, isNewUser })
    }

    // ── set-password ──
    if (action === 'set-password') {
      const email = (body.email || '').toLowerCase().trim()
      const password = String(body.password || '')
      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters.' })
      }
      const userRows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
      if (userRows.length === 0) {
        return res.status(400).json({ error: 'User not found.' })
      }
      await sql`UPDATE users SET password_hash = ${hashPassword(password)} WHERE email = ${email}`
      return res.status(200).json({ ok: true })
    }

    // ── register ──
    if (action === 'register') {
      const email = (body.email || '').toLowerCase().trim()
      const name = String(body.name || '').trim()
      const phone = String(body.phone || '').trim()
      const password = String(body.password || '')
      if (!email || !name || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required.' })
      }
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email.' })
      }
      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters.' })
      }
      const existsEmail = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
      if (existsEmail.length > 0) {
        return res.status(400).json({ error: 'This email is already registered. Please log in.' })
      }
      const existsPhone = await sql`SELECT id FROM users WHERE phone = ${phone} LIMIT 1`
      if (existsPhone.length > 0) {
        return res.status(400).json({ error: 'This phone number is already linked to an account.' })
      }
      const [user] = await sql`
        INSERT INTO users (name, phone, email, password_hash)
        VALUES (${name}, ${phone}, ${email}, ${hashPassword(password)})
        RETURNING id, name, email, phone
      `
      return res.status(201).json({ ok: true, user })
    }

    // ── login ──
    if (action === 'login') {
      const email = (body.email || '').toLowerCase().trim()
      const password = String(body.password || '')
      const rows = await sql`SELECT id, name, email, phone, password_hash FROM users WHERE email = ${email} LIMIT 1`
      if (rows.length === 0) {
        return res.status(400).json({ error: 'No account found with this email.' })
      }
      const u = rows[0]
      if (!u.password_hash || u.password_hash !== hashPassword(password)) {
        return res.status(400).json({ error: 'Incorrect password.' })
      }
      return res.status(200).json({
        ok: true,
        user: { id: u.id, name: u.name, email: u.email, phone: u.phone },
      })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
