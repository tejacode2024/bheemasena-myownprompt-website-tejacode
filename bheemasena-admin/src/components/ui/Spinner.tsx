export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="bhm-spin"
      style={{
        width: size, height: size, display: 'inline-block',
        border: '2px solid currentColor', borderTopColor: 'transparent',
        borderRadius: '50%',
      }}
      aria-label="Loading"
    />
  )
}
