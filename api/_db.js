import { createClient } from '@supabase/supabase-js'

let _client = null

export function db() {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY')
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

export function guard(req, res) {
  const provided = req.headers['x-admin-secret']
  const expected = process.env.ADMIN_SECRET
  if (!expected || provided !== expected) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export async function readJSON(req) {
  if (req.body && typeof req.body === 'object') return req.body
  return await new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => {
      if (!data) return resolve({})
      try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

export function istHour() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).getUTCHours()
}

export function sessionType() {
  const h = istHour()
  return (h >= 6 && h < 14) ? 'lunch' : 'dinner'
}
