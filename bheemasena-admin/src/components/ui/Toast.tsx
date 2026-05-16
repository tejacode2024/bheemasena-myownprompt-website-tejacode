import { useUIStore } from '../../state/uiStore'
import { CheckCircle2, AlertCircle, Info, Wifi } from 'lucide-react'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  'new-order': Wifi,
}

export function ToastHost() {
  const toasts = useUIStore(s => s.toasts)
  const remove = useUIStore(s => s.removeToast)
  return (
    <>
      {toasts.map((t, i) => {
        const Icon = ICONS[t.tone]
        return (
          <div
            key={t.id}
            className={`admin-toast ${t.tone}`}
            style={{ top: `${72 + i * 56}px` }}
            role="status"
            onClick={() => remove(t.id)}
          >
            <Icon size={14} />
            <span>{t.msg}</span>
          </div>
        )
      })}
    </>
  )
}
