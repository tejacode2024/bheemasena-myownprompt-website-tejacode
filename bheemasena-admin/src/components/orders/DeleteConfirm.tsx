import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Spinner } from '../ui/Spinner'
import { api, type RawOrder } from '../../lib/api'
import { useAdminStore } from '../../state/adminStore'
import { useOrdersStore } from '../../state/ordersStore'
import { useUIStore } from '../../state/uiStore'
import { tokenDisplay } from '../../lib/format'

export function DeleteConfirm({ order, open, onClose }: { order: RawOrder; open: boolean; onClose: () => void }) {
  const secret = useAdminStore(s => s.secret)
  const removeLocal = useOrdersStore(s => s.removeLocal)
  const toast = useUIStore(s => s.addToast)
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    try {
      await api.deleteOrder(order.token_number, secret)
      removeLocal(order.token_number)
      toast('Order deleted', 'success')
      onClose()
    } catch (e: any) {
      toast(e?.message || 'Delete failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} hideClose>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 12, marginBottom: 20,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(181,82,74,0.10)', color: 'var(--color-danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trash2 size={20} strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 18 }}>Delete order?</div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          {tokenDisplay(order.token_number)} · {order.customer_name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)', maxWidth: 320 }}>
          This permanently removes the order from the system. This cannot be undone.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="pill-btn pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" className="pill-btn pill-danger" disabled={busy} onClick={go}>
          {busy ? <Spinner size={12} /> : 'Delete order'}
        </button>
      </div>
    </Sheet>
  )
}
