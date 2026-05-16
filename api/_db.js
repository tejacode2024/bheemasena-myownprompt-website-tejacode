import { neon } from '@neondatabase/serverless'

let _sql = null

export function db() {
  if (_sql) return _sql
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Missing DATABASE_URL')
  _sql = neon(url)
  return _sql
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
