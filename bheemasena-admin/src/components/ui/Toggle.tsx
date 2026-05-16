type Props = {
  on: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label?: string
}

export function Toggle({ on, onChange, disabled, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label ?? 'Toggle'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`toggle-track ${on ? 'on' : 'off'}`}
    >
      <span className="toggle-thumb" />
    </button>
  )
}
