import type { LucideIcon } from 'lucide-react'

type Tone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

const TONE_CLASS: Record<Tone, string> = {
  default: '',
  accent:  'stat-accent',
  success: 'stat-success',
  warning: 'stat-warning',
  danger:  'stat-danger',
}

export function StatCard({
  label, value, tone = 'default', Icon, compact,
}: {
  label: string
  value: string | number
  tone?: Tone
  Icon?: LucideIcon
  compact?: boolean
}) {
  return (
    <div className="stat-card" style={compact ? { padding: 12 } : undefined}>
      {Icon ? (
        <div className="stat-icon">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      ) : null}
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${TONE_CLASS[tone]}`} style={compact ? { fontSize: 22 } : undefined}>
        {value}
      </div>
    </div>
  )
}
