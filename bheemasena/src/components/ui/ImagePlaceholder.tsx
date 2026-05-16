type Props = {
  aspect?: string
  label?: string
  className?: string
  rounded?: number
}

export function ImagePlaceholder({ aspect = '1/1', label = 'image', className, rounded = 4 }: Props) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={className}
      style={{
        aspectRatio: aspect,
        width: '100%',
        background: 'var(--color-cream)',
        border: '1px solid rgba(14,14,12,0.06)',
        borderRadius: rounded,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-faint)',
        fontStyle: 'italic',
        fontSize: 13,
        letterSpacing: '0.04em',
        overflow: 'hidden',
      }}
    >
      {label}
    </div>
  )
}
