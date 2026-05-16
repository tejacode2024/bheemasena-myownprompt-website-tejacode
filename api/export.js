import ExcelJS from 'exceljs'
import { db, guard } from './_db.js'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtTitle(d) {
  const dd = String(d.getDate()).padStart(2, '0')
  return `${dd} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function fmtDT(d) {
  if (!d) return ''
  const dt = new Date(d)
  const dd = String(dt.getDate()).padStart(2, '0')
  let h = dt.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12
  return `${dd} ${MONTHS[dt.getMonth()]} ${String(h).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')} ${ap}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!guard(req, res)) return

  const supa = db()
  const { data: orders, error } = await supa
    .from('orders').select('*').eq('archived', false)
    .order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Bheemasena Admin'
  const ws = wb.addWorksheet('Orders')

  ws.columns = [
    { width: 8  }, { width: 22 }, { width: 14 }, { width: 40 }, { width: 6  },
    { width: 14 }, { width: 10 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 20 }, { width: 20 },
  ]

  ws.mergeCells('A1:L1')
  const titleCell = ws.getCell('A1')
  titleCell.value = `BHEEMASENA — Today's Orders | ${fmtTitle(new Date())}`
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF0E0E0C' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' }

  const headers = ['Token','Name','Phone','Item','Qty','Payment Mode','Total','Payment Status','Pending Amount','Deliver Status','Date & Time','Delivered At']
  const headerRow = ws.getRow(3)
  headers.forEach((h, i) => {
    const c = headerRow.getCell(i + 1)
    c.value = h
    c.font = { bold: true }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF8F3' } }
    c.alignment = { vertical: 'middle' }
    c.border = { bottom: { style: 'thin', color: { argb: 'FF6B655C' } } }
  })

  let rowIdx = 4
  for (const o of orders) {
    const items = Array.isArray(o.items) ? o.items : []
    if (items.length === 0) {
      ws.getRow(rowIdx++).values = [
        `#${String(o.token_number).padStart(3,'0')}`,
        o.customer_name, o.customer_phone, '', '',
        o.payment_mode, o.total, o.pay_status, o.pending_amount ?? '',
        o.deliver_status, fmtDT(o.created_at), fmtDT(o.delivered_at),
      ]
      continue
    }
    items.forEach((it, idx) => {
      ws.getRow(rowIdx++).values = [
        idx === 0 ? `#${String(o.token_number).padStart(3,'0')}` : '',
        idx === 0 ? o.customer_name : '',
        idx === 0 ? o.customer_phone : '',
        it.name, it.qty,
        idx === 0 ? o.payment_mode : '',
        idx === 0 ? o.total : '',
        idx === 0 ? o.pay_status : '',
        idx === 0 ? (o.pending_amount ?? '') : '',
        idx === 0 ? o.deliver_status : '',
        idx === 0 ? fmtDT(o.created_at) : '',
        idx === 0 ? fmtDT(o.delivered_at) : '',
      ]
    })
  }

  const buf = await wb.xlsx.writeBuffer()
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="bheemasena-orders-${new Date().toISOString().slice(0,10)}.xlsx"`)
  return res.status(200).send(Buffer.from(buf))
}
