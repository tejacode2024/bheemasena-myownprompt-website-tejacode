let _promise: Promise<any> | null = null

export function loadExcelJS(): Promise<any> {
  if (_promise) return _promise
  _promise = new Promise((res, rej) => {
    if ((window as any).ExcelJS) { res((window as any).ExcelJS); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js'
    s.onload = () => res((window as any).ExcelJS)
    s.onerror = () => { _promise = null; rej(new Error('ExcelJS load failed')) }
    document.head.appendChild(s)
  })
  return _promise
}

export function triggerDownload(
  buf: ArrayBuffer | Blob,
  filename: string,
  mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
) {
  const blob = buf instanceof Blob ? buf : new Blob([buf], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); document.body.removeChild(a) }, 1000)
}
