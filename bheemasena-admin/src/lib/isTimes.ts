export function nowIST(): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 5.5 * 3600000)
}

export function isLunchOrder(createdAt: string | Date): boolean {
  const raw = typeof createdAt === 'string' ? createdAt : createdAt.toISOString()
  const utcStr = raw.endsWith('Z') || raw.includes('+') ? raw : raw + 'Z'
  const ist = new Date(new Date(utcStr).getTime() + (5 * 60 + 30) * 60000)
  const h = ist.getUTCHours()
  return h < 14
}

export function currentSession(): 'lunch' | 'dinner' {
  const h = nowIST().getHours()
  return h >= 6 && h < 14 ? 'lunch' : 'dinner'
}
