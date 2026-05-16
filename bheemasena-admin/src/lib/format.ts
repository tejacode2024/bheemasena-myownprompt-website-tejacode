const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function fmtMoney(n: number): string {
  return `₹${n}`
}

export function fmtDT(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  const dd = String(dt.getDate()).padStart(2, '0')
  const mon = MONTHS[dt.getMonth()]
  let h = dt.getHours()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${dd} ${mon} | ${String(h).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')} ${ap}`
}

export function fmtDateKey(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export function fmtDateLabel(d: Date): string {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(d); target.setHours(0,0,0,0)
  const diff = Math.round((today.getTime() - target.getTime()) / (1000 * 3600 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  const wk = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]
  return `${wk} ${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}`
}

export function tokenDisplay(t: string | number): string {
  return `#${String(t).padStart(3, '0')}`
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many
}
