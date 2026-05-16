import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, ChevronDown, Pencil, RotateCcw } from 'lucide-react'
import { Toggle } from '../components/ui/Toggle'
import { Tag } from '../components/ui/Tag'
import { VegDot } from '../components/menu/VegDot'
import { AddItemForm } from '../components/menu/AddItemForm'
import { EditModal } from '../components/menu/EditModal'
import { MENU_DATA, type MenuItem } from '../data/menuData'
import { api, type DynamicMenuItem } from '../lib/api'
import { useAdminStore } from '../state/adminStore'
import { useUIStore } from '../state/uiStore'
import { fmtMoney } from '../lib/format'

type EditTarget =
  | { kind: 'static'; categoryKey: string; item: MenuItem }
  | { kind: 'dynamic'; item: DynamicMenuItem }
  | null

export function MenuItemsTab() {
  const itemFlags = useAdminStore(s => s.itemFlags)
  const priceOverrides = useAdminStore(s => s.priceOverrides)
  const originalOverrides = useAdminStore(s => s.originalPriceOverrides)
  const hiddenItems = useAdminStore(s => s.hiddenItems)
  const patchConfig = useAdminStore(s => s.patchConfig)
  const categoryHeadings = useAdminStore(s => s.categoryHeadings)
  const toast = useUIStore(s => s.addToast)

  const [dynamic, setDynamic] = useState<DynamicMenuItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
  const [edit, setEdit] = useState<EditTarget>(null)

  async function reloadDynamic() {
    try { setDynamic(await api.fetchMenu()) } catch { /* ignore */ }
  }
  useEffect(() => { reloadDynamic() }, [])

  const staticCats = Object.values(MENU_DATA)

  const dynamicByCategory = useMemo(() => {
    const out: Record<string, DynamicMenuItem[]> = {}
    for (const d of dynamic) {
      const k = d.category_key
      if (!out[k]) out[k] = []
      out[k].push(d)
    }
    return out
  }, [dynamic])

  const allCategoryKeys = useMemo(() => {
    const k = new Set<string>(staticCats.map(c => c.key))
    for (const d of dynamic) k.add(d.category_key)
    return Array.from(k)
  }, [dynamic, staticCats])

  function toggleCat(k: string) { setOpenCats(s => ({ ...s, [k]: !s[k] })) }
  const isOpen = (k: string) => openCats[k] ?? true

  function matchesSearch(name: string) {
    if (!search.trim()) return true
    return name.toLowerCase().includes(search.toLowerCase())
  }

  async function toggleItemFlag(id: string, next: boolean) {
    try {
      await patchConfig({ item_flags: { ...itemFlags, [id]: next } })
    } catch { toast('Could not update item', 'error') }
  }

  async function restorePrice(id: string) {
    const nextP = { ...priceOverrides }; delete nextP[id]
    const nextO = { ...originalOverrides }; delete nextO[id]
    try { await patchConfig({ price_overrides: nextP, original_price_overrides: nextO }); toast('Price restored', 'success') }
    catch { toast('Restore failed', 'error') }
  }

  async function restoreHidden(id: string) {
    const next = hiddenItems.filter(x => x !== id)
    try { await patchConfig({ hidden_items: next }); toast('Item restored', 'success') }
    catch { toast('Restore failed', 'error') }
  }

  return (
    <div style={{ padding: 'clamp(16px,3vw,24px)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
            Menu management
          </div>
          <div style={{ fontSize: 18, color: 'var(--color-ink)' }}>Items & categories</div>
        </div>
        <button type="button" className="pill-btn pill-accent" onClick={() => setShowAdd(v => !v)}>
          <Plus size={12} /> {showAdd ? 'Close' : 'Add new item →'}
        </button>
      </div>

      {showAdd && <AddItemForm onClose={() => setShowAdd(false)} onAdded={reloadDynamic} />}

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', top: 17, left: 12, color: 'var(--color-muted)', pointerEvents: 'none' }} />
        <input
          className="admin-input"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {allCategoryKeys.map(k => {
        const staticCat = MENU_DATA[k]
        const dynItems = dynamicByCategory[k] ?? []
        const label = staticCat?.label ?? dynItems[0]?.category_label ?? k
        const heading = categoryHeadings[k] ?? staticCat?.defaultHeading ?? null
        const staticItems = (staticCat?.items ?? []).filter(i => !hiddenItems.includes(i.id))
        const hiddenInCat = (staticCat?.items ?? []).filter(i => hiddenItems.includes(i.id))
        const filteredStatic = staticItems.filter(i => matchesSearch(i.name))
        const filteredDynamic = dynItems.filter(i => matchesSearch(i.name))
        const totalActive = filteredStatic.length + filteredDynamic.length
        if (search && totalActive === 0) return null

        return (
          <section key={k} className="admin-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleCat(k)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '12px 16px', background: 'var(--color-cream)',
                border: 'none', borderBottom: '1px solid var(--color-admin-border)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
              aria-expanded={isOpen(k)}
            >
              <span style={{ fontSize: 14, color: 'var(--color-ink)', flexShrink: 0 }}>{label}</span>
              <Tag>{totalActive} items</Tag>
              {heading && (
                <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--color-muted)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{heading.prefix} {heading.italic}"
                </span>
              )}
              {!staticCat && <Tag tone="placed">Added</Tag>}
              <ChevronDown
                size={16}
                style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: isOpen(k) ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {isOpen(k) && (
              <div>
                {filteredStatic.map((it) => {
                  const flag = itemFlags[it.id] !== false
                  const overridden = priceOverrides[it.id] != null
                  const livePrice = priceOverrides[it.id] ?? it.price
                  const orig = originalOverrides[it.id]
                  const discount = orig && orig > livePrice ? Math.round((1 - livePrice / orig) * 100) : 0
                  return (
                    <div key={it.id} style={rowStyle(!flag)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <VegDot veg={!!it.veg} />
                        <span style={{ fontSize: 13, color: 'var(--color-ink)', textDecoration: flag ? 'none' : 'line-through' }}>
                          {it.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 15, color: 'var(--color-accent)' }}>{fmtMoney(livePrice)}</span>
                          {orig && <span style={{ fontSize: 12, color: 'var(--color-muted)', textDecoration: 'line-through' }}>{fmtMoney(orig)}</span>}
                          {discount > 0 && <Tag tone="placed">{discount}% off</Tag>}
                          {overridden && (
                            <span style={{
                              fontSize: 10, color: 'var(--color-muted)',
                              background: 'rgba(14,14,12,0.04)', padding: '2px 6px', borderRadius: 999,
                            }}>
                              code: {fmtMoney(it.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {overridden && (
                          <button
                            type="button"
                            onClick={() => restorePrice(it.id)}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: 'var(--color-accent)', fontFamily: 'inherit', fontSize: 11,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                            }}
                          >
                            Restore
                          </button>
                        )}
                        <Toggle on={flag} onChange={(v) => toggleItemFlag(it.id, v)} label="Item available" />
                        <button
                          type="button"
                          onClick={() => setEdit({ kind: 'static', categoryKey: k, item: it })}
                          aria-label="Edit item"
                          style={{
                            width: 32, height: 32, border: '1px solid var(--color-admin-border)',
                            background: 'transparent', borderRadius: 6, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Pencil size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {filteredDynamic.map((it) => (
                  <div key={`dyn-${it.id}`} style={rowStyle(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <VegDot veg={!!it.veg} />
                      {it.img && (
                        <img src={it.img} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                      )}
                      <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>{it.name}</span>
                      <Tag tone="placed">Added</Tag>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 15, color: 'var(--color-accent)' }}>{fmtMoney(it.price)}</span>
                        {it.original_price && (
                          <span style={{ fontSize: 12, color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                            {fmtMoney(it.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEdit({ kind: 'dynamic', item: it })}
                      aria-label="Edit item"
                      style={{
                        width: 32, height: 32, border: '1px solid var(--color-admin-border)',
                        background: 'transparent', borderRadius: 6, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Pencil size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}

                {hiddenInCat.length > 0 && (
                  <div style={{
                    padding: '10px 16px', background: 'rgba(181,82,74,0.04)',
                    borderTop: '1px solid var(--color-admin-border-sub)',
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-danger)', marginBottom: 6 }}>
                      Hidden items
                    </div>
                    {hiddenInCat.map(it => (
                      <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--color-muted)', textDecoration: 'line-through' }}>{it.name}</span>
                        <button
                          type="button"
                          onClick={() => restoreHidden(it.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--color-warning)', fontFamily: 'inherit', fontSize: 11,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                          }}
                        >
                          <RotateCcw size={11} /> Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}

      <EditModal target={edit} open={!!edit} onClose={() => setEdit(null)} onChanged={reloadDynamic} />
    </div>
  )
}

function rowStyle(faded: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '12px 16px', borderBottom: '1px solid var(--color-admin-border-sub)',
    opacity: faded ? 0.55 : 1,
  }
}
