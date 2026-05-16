import { useState } from 'react'
import { Spinner } from '../ui/Spinner'
import { MENU_DATA, MENU_CATEGORY_KEYS } from '../../data/menuData'
import { api } from '../../lib/api'
import { useAdminStore } from '../../state/adminStore'
import { useUIStore } from '../../state/uiStore'

export function AddItemForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const secret = useAdminStore(s => s.secret)
  const toast = useUIStore(s => s.addToast)

  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [existingKey, setExistingKey] = useState<string>(MENU_CATEGORY_KEYS[0] ?? '')
  const [newCategory, setNewCategory] = useState('')

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [original, setOriginal] = useState('')
  const [veg, setVeg] = useState(true)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price) { toast('Name and price are required', 'error'); return }

    let category_key: string
    let category_label: string

    if (mode === 'existing') {
      const cat = MENU_DATA[existingKey]
      category_key = existingKey
      category_label = cat?.label ?? existingKey
    } else {
      const key = newCategory.trim().toLowerCase().replace(/\s+/g, '-')
      if (!key) { toast('Category name required', 'error'); return }
      category_key = key
      category_label = newCategory.trim()
    }

    setBusy(true)
    try {
      await api.addMenuItem({
        category_key, category_label, category_heading: null,
        name: name.trim(), desc: desc.trim() || null,
        price: Number(price), original_price: original ? Number(original) : null,
        veg, img: null,
      }, secret)
      toast('Item added to menu', 'success')
      onAdded()
      onClose()
    } catch (e: any) {
      toast(e?.message || 'Add failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="admin-card" style={{ padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <SegBtn active={mode === 'existing'} onClick={() => setMode('existing')}>Existing category</SegBtn>
        <SegBtn active={mode === 'new'} onClick={() => setMode('new')}>+ New category</SegBtn>
      </div>

      {mode === 'existing' ? (
        <div style={{ marginBottom: 14 }}>
          <label className="admin-label">Category</label>
          <select
            className="admin-input admin-select"
            value={existingKey}
            onChange={(e) => setExistingKey(e.target.value)}
          >
            {MENU_CATEGORY_KEYS.map(k => (
              <option key={k} value={k}>{MENU_DATA[k].label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <label className="admin-label">Category name</label>
          <input className="admin-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Signature plates" />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="admin-label">Item name</label>
        <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Royal Rose Lassi" required />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="admin-label">Description</label>
        <textarea
          className="admin-input admin-textarea"
          value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="A short, evocative line…" rows={2}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div>
          <label className="admin-label">Offer price ₹</label>
          <input className="admin-input" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">Original / MRP ₹</label>
          <input className="admin-input" type="number" min={0} value={original} onChange={(e) => setOriginal(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="admin-label">Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setVeg(true)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
              background: veg ? 'rgba(74,124,89,0.08)' : 'transparent',
              border: `1.5px solid ${veg ? 'var(--color-success)' : 'var(--color-admin-border)'}`,
              fontFamily: 'inherit', fontSize: 13, color: 'var(--color-ink)',
            }}
          >
            Veg
          </button>
          <button
            type="button"
            onClick={() => setVeg(false)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
              background: !veg ? 'rgba(181,82,74,0.08)' : 'transparent',
              border: `1.5px solid ${!veg ? 'var(--color-danger)' : 'var(--color-admin-border)'}`,
              fontFamily: 'inherit', fontSize: 13, color: 'var(--color-ink)',
            }}
          >
            Non-veg
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="pill-btn pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="submit" className="pill-btn pill-accent" disabled={busy}>
          {busy ? <Spinner size={12} /> : 'Add to menu →'}
        </button>
      </div>
    </form>
  )
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
        background: active ? 'var(--color-ink)' : 'transparent',
        color: active ? 'var(--color-cream)' : 'var(--color-ink)',
        border: `1px solid ${active ? 'var(--color-ink)' : 'var(--color-admin-border)'}`,
        fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      }}
    >
      {children}
    </button>
  )
}
