export function VegDot({ veg }: { veg: boolean }) {
  return (
    <span
      className={`veg-dot${veg ? '' : ' nonveg'}`}
      aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
      role="img"
    />
  )
}
