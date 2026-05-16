import { useState } from 'react'
import { MediaPlaceholder } from '../ui/MediaPlaceholder'

const MARQUEE_IMAGES = [
  '/images/marquee/dish-1.jpeg',
  '/images/marquee/dish-2.jpeg',
  '/images/marquee/dish-3.jpeg',
  '/images/marquee/dish-4.jpeg',
  '/images/marquee/dish-5.jpeg',
  '/images/marquee/dish-6.jpeg',
  '/images/marquee/dish-7.jpeg',
  '/images/marquee/dish-8.jpeg',
]

export function Marquee() {
  const [paused, setPaused] = useState(false)

  return (
    <section
      aria-label="Gallery marquee"
      style={{
        padding: 'clamp(48px,6vw,80px) 0',
        background: 'var(--color-paper)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ position: 'relative' }}
      >
        <div className={`marquee-track ${paused ? 'paused' : ''}`}>
          {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((src, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 'clamp(280px, 32vw, 460px)',
              }}
            >
              <MediaPlaceholder aspect="4/3" label="dish" src={src}  />
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: 80,
            background: 'linear-gradient(90deg, var(--color-paper), transparent)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, bottom: 0, right: 0, width: 80,
            background: 'linear-gradient(270deg, var(--color-paper), transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </section>
  )
}
