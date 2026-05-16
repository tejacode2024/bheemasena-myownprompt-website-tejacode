import { useMemo, useState } from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { MENU_SUGGESTIONS, priceByName } from '../../data/menuData'
import { api, type RawOrder } from '../../lib/api'
import { useAdminStore } from '../../state/adminStore'
import { useOrdersStore } from '../../state/ordersStore'
import { useUIStore } from '../../state/uiStore'
import { tokenDisplay, fmtMoney } from '../../lib/format'
import { Spinner } from '../ui/Spinner'

type ItemRow = { name: string; qty: number }

export function UpdateModal({ order, open, onClose }: { order: RawOrder; open: boolean; onClose: () => void }) {
  const secret = useAdminStore(s => s.secret)
  const patchLocal = useOrdersStore(s => s.patchLocal)
  const toast = useUIStore(s => s.addToast)

  const [items, setItems] = useState<ItemRow[]>(() => order.items.map(i => ({ ...i })))
  const [query, setQuery] = useState('')
  const [newQty, setNewQty] = useState(1)
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState(0)

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return MENU_SUGGESTIONS.filter(m => m.name.toLowerCase().includes(q)).slice(0, 6)
  }, [query])

  const total = useMemo(
    () => items.reduce((s, it) => s + priceByName(it.name, 0) * it.qty, 0),
    [items],
  )

  function step(i: number, delta: number) {
    setItems(items.map((it, idx) => idx === i ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
  }
  function remove(i: number) {
    setItems(items.filter((_, idx) => idx !== i))
  }
  function addItemFromName(name: string) {
    const existing = items.findIndex(it => it.name.toLowerCase() === name.toLowerCase())
    if (existing !== -1) {
      setItems(items.map((it, idx) => idx === existing ? { ...it, qty: it.qty + newQty } : it))
    } else {
      setItems([...items, { name, qty: newQty }])
    }
    setQuery('')
    setNewQty(1)
    setActive(0)
  }
  function tryAdd() {
    const m = matches[active]
    if (m) addItemFromName(m.name)
    else if (query.trim()) addItemFromName(query.trim())
  }
  async function save() {
    if (items.length === 0) { toast('Order must have at least 1 item', 'error'); return }
    setSaving(true)
    try {
      const updated = await api.patchOrder(order.token_number, { items, total }, secret)
      patchLocal(order.token_number, updated)
      toast('Order updated', 'success')
      onClose()
    } catch (e: any) {
      toast(e?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Update order"
      subtitle={`${tokenDisplay(order.token_number)} · ${order.customer_name}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-cream)', padding: '8px 12px', borderRadius: 4,
            }}
          >
            <span style={{ flex: 1, fontSize: 13, color: 'var(--color-ink)' }}>{it.name}</span>
            <button type="button" onClick={() => step(i, -1)} disabled={it.qty <= 1}
              aria-label="Decrease quantity"
              style={iconBtnStyle}>
              <Minus size={14} />
            </button>
            <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13 }}>{it.qty}</span>
            <button type="button" onClick={() => step(i, 1)} aria-label="Increase quantity" style={iconBtnStyle}>
              <Plus size={14} />
            </button>
            <button type="button" onClick={() => remove(i)} aria-label="Remove item"
              style={{ ...iconBtnStyle, color: 'var(--color-danger)' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--color-admin-border)', paddingTop: 16, marginBottom: 16 }}>
        <label className="admin-label">Add item</label>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input
            className="admin-input"
            placeholder="Search menu…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, matches.length - 1)) }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)) }
              else if (e.key === 'Enter') { e.preventDefault(); tryAdd() }
            }}
          />
          {matches.length > 0 && (
            <div
              role="listbox"
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'var(--color-admin-surface)', border: '1px solid var(--color-admin-border)',
                borderRadius: 4, marginTop: 4, boxShadow: 'var(--shadow-hover)',
              }}
            >
              {matches.map((m, idx) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => addItemFromName(m.name)}
                  onMouseEnter={() => setActive(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '8px 12px', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, textAlign: 'left',
                    background: idx === active ? 'var(--color-cream)' : 'transparent',
                  }}
                >
                  <span>{m.name}</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{fmtMoney(m.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setNewQty(Math.max(1, newQty - 1))} style={iconBtnStyle} aria-label="Decrease">
            <Minus size={14} />
          </button>
          <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13 }}>{newQty}</span>
          <button type="button" onClick={() => setNewQty(newQty + 1)} style={iconBtnStyle} aria-label="Increase">
            <Plus size={14} />
          </button>
          <button type="button" onClick={tryAdd} className="pill-btn pill-primary" style={{ marginLeft: 'auto' }}>
            Add
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', borderTop: '1px solid var(--color-admin-border)', marginBottom: 16,
      }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
          New total
        </span>
        <span style={{ fontSize: 22, color: 'var(--color-ink)' }}>{fmtMoney(total)}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="pill-btn pill-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="pill-btn pill-accent" disabled={saving} onClick={save}>
          {saving ? <Spinner size={12} /> : 'Save changes →'}
        </button>
      </div>
    </Sheet>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, border: '1px solid var(--color-admin-border)',
  background: 'transparent', borderRadius: 6, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
