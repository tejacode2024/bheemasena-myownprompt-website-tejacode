import { MediaPlaceholder } from '../ui/MediaPlaceholder'
import { useUIStore } from '../../state/uiStore'

const TILE_PATTERN = [true, false, true, true, true, false, true, true]

export function Gallery() {
  const toast = useUIStore((s) => s.toast)

  return (
    <section
      aria-label="Gallery"
      style={{
        padding: 'clamp(40px,6vw,80px) clamp(24px,6vw,96px)',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
          gap: 4,
        }}
        className="gallery-grid"
      >
        {(() => {
          let imgIdx = 0
          return TILE_PATTERN.map((filled, idx) =>
            filled ? (
              <MediaPlaceholder key={idx} aspect="1/1" label="image" src={`/images/gallery/gallery-${++imgIdx}.jpeg`} />
            ) : (
              <div key={idx} style={{ aspectRatio: '1/1', background: 'var(--color-cream)' }} />
            )
          )
        })()}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          type="button"
          className="pill-btn pill-ghost"
          onClick={() => toast('Full gallery — coming soon', 'info')}
        >
          SEE ALL PHOTOS →
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
      `}</style>
    </section>
  )
}
