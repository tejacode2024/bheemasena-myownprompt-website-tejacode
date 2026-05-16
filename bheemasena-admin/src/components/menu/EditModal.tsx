import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Spinner } from '../ui/Spinner'
import { api, type DynamicMenuItem } from '../../lib/api'
import { useAdminStore } from '../../state/adminStore'
import { useUIStore } from '../../state/uiStore'
import { MENU_DATA, type MenuItem } from '../../data/menuData'

type StaticEdit = {
  kind: 'static'
  categoryKey: string
  item: MenuItem
}
type DynamicEdit = {
  kind: 'dynamic'
  item: DynamicMenuItem
}
type Target = StaticEdit | DynamicEdit

export function EditModal({
  target, open, onClose, onChanged,
}: {
  target: Target | null
  open: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const secret = useAdminStore(s => s.secret)
  const patchConfig = useAdminStore(s => s.patchConfig)
  const priceOverrides = useAdminStore(s => s.priceOverrides)
  const originalOverrides = useAdminStore(s => s.originalPriceOverrides)
  const hiddenItems = useAdminStore(s => s.hiddenItems)
  const categoryHeadings = useAdminStore(s => s.categoryHeadings)
  const toast = useUIStore(s => s.addToast)

  const [price, setPrice] = useState('')
  const [original, setOriginal] = useState('')
  const [desc, setDesc] = useState('')
  const [headingPrefix, setHeadingPrefix] = useState('')
  const [headingItalic, setHeadingItalic] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!target) return
    if (target.kind === 'static') {
      const id = target.item.id
      const cat = MENU_DATA[target.categoryKey]
      setPrice(String(priceOverrides[id] ?? target.item.price))
      setOriginal(originalOverrides[id] != null ? String(originalOverrides[id]) : '')
      const h = categoryHeadings[target.categoryKey] ?? cat?.defaultHeading ?? { prefix: '', italic: '' }
      setHeadingPrefix(h.prefix)
      setHeadingItalic(h.italic)
      setDesc('')
    } else {
      setPrice(String(target.item.price))
      setOriginal(target.item.original_price != null ? String(target.item.original_price) : '')
      setDesc(target.item.desc ?? '')
      let parsed = { prefix: '', italic: '' }
      try { if (target.item.category_heading) parsed = JSON.parse(target.item.category_heading) } catch { /* ignore */ }
      setHeadingPrefix(parsed.prefix)
      setHeadingItalic(parsed.italic)
    }
  }, [target, priceOverrides, originalOverrides, categoryHeadings])

  if (!target) return null

  async function save() {
    setBusy(true)
    try {
      if (target!.kind === 'static') {
        const id = target!.item.id
        const newPriceOverrides = { ...priceOverrides }
        const newOriginalOverrides = { ...originalOverrides }
        const newCategoryHeadings = { ...categoryHeadings }

        const priceNum = Number(price)
        if (priceNum && priceNum !== target!.item.price) newPriceOverrides[id] = priceNum
        else delete newPriceOverrides[id]

        if (original) newOriginalOverrides[id] = Number(original)
        else delete newOriginalOverrides[id]

        if (headingPrefix || headingItalic) {
          newCategoryHeadings[target!.categoryKey] = { prefix: headingPrefix, italic: headingItalic }
        }

        await patchConfig({
          price_overrides: newPriceOverrides,
          original_price_overrides: newOriginalOverrides,
          category_headings: newCategoryHeadings,
        })
        toast('Item updated', 'success')
      } else {
        const headingPayload = (headingPrefix || headingItalic)
          ? JSON.stringify({ prefix: headingPrefix, italic: headingItalic })
          : null
        await api.patchMenuItem(target!.item.id, {
          price: Number(price),
          original_price: original ? Number(original) : null,
          desc: desc || null,
          category_heading: headingPayload,
        }, secret)
        toast('Item updated', 'success')
      }
      onChanged()
      onClose()
    } catch (e: any) {
      toast(e?.message || 'Update failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Hide or remove this item from the menu?')) return
    setBusy(true)
    try {
      if (target!.kind === 'static') {
        const id = target!.item.id
        const next = Array.from(new Set([...hiddenItems, id]))
        await patchConfig({ hidden_items: next })
        toast('Item hidden from menu', 'success')
      } else {
        await api.deleteMenuItem(target!.item.id, secret)
        toast('Item deleted', 'success')
      }
      onChanged()
      onClose()
    } catch (e: any) {
      toast(e?.message || 'Delete failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  const subtitle = target.kind === 'static'
    ? `${MENU_DATA[target.categoryKey]?.label ?? target.categoryKey} · ${target.item.name}`
    : `${target.item.category_label} · ${target.item.name}`

  return (
    <Sheet open={open} onClose={onClose} title="Edit menu item" subtitle={subtitle}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div>
          <label className="admin-label">Offer price ₹</label>
          <input className="admin-input" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Original ₹</label>
          <input className="admin-input" type="number" min={0} value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="—" />
        </div>
      </div>

      {target.kind === 'dynamic' && (
        <div style={{ marginBottom: 14 }}>
          <label className="admin-label">Description</label>
          <textarea
            className="admin-input admin-textarea"
            value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
          />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="admin-label">Category heading</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input className="admin-input" placeholder="Prefix" value={headingPrefix} onChange={(e) => setHeadingPrefix(e.target.value)} />
          <input className="admin-input" placeholder="Italic word" value={headingItalic} onChange={(e) => setHeadingItalic(e.target.value)} />
        </div>
        <div style={{
          marginTop: 10, padding: '10px 12px',
          background: 'var(--color-cream)', borderRadius: 4,
          fontSize: 16, color: 'var(--color-ink)',
        }}>
          {headingPrefix || '—'} <em style={{ color: 'var(--color-accent)' }}>{headingItalic}</em>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          className="pill-btn pill-danger"
          onClick={remove}
          disabled={busy}
          aria-label={target.kind === 'static' ? 'Hide item' : 'Delete item'}
        >
          <Trash2 size={12} /> {target.kind === 'static' ? 'Hide' : 'Delete'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="pill-btn pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="pill-btn pill-accent" onClick={save} disabled={busy}>
            {busy ? <Spinner size={12} /> : 'Save changes →'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
