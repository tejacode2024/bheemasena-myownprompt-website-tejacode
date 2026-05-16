import { useState } from 'react'
import { usePrefersReducedMotion } from '../../lib/format'

type Props = {
  aspect?: string
  label?: string
  className?: string
  rounded?: number
  src?: string
  type?: 'auto' | 'image' | 'video'
  poster?: string
  alt?: string
}

const VIDEO_EXT = /\.(mp4|webm|mov)(\?.*)?$/i

function resolveKind(src: string | undefined, type: Props['type']): 'image' | 'video' | 'none' {
  if (!src) return 'none'
  if (type === 'video') return 'video'
  if (type === 'image') return 'image'
  return VIDEO_EXT.test(src) ? 'video' : 'image'
}

function PlaceholderBox({
  aspect, label, className, rounded,
}: Required<Pick<Props, 'aspect' | 'label' | 'rounded'>> & { className?: string }) {
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

export function MediaPlaceholder({
  aspect = '1/1',
  label = 'image',
  className,
  rounded = 4,
  src,
  type = 'auto',
  poster,
  alt,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const [failed, setFailed] = useState(false)
  const kind = resolveKind(src, type)

  if (failed || kind === 'none') {
    return <PlaceholderBox aspect={aspect} label={label} className={className} rounded={rounded} />
  }

  if (kind === 'video') {
    if (reduced) {
      if (!poster) {
        return <PlaceholderBox aspect={aspect} label={label} className={className} rounded={rounded} />
      }
      return (
        <div
          className={className}
          style={{
            aspectRatio: aspect, width: '100%',
            borderRadius: rounded, overflow: 'hidden',
            background: 'var(--color-cream)',
          }}
        >
          <img
            src={poster}
            alt={alt ?? ''}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )
    }
    return (
      <div
        className={className}
        style={{
          aspectRatio: aspect, width: '100%',
          borderRadius: rounded, overflow: 'hidden',
          background: 'var(--color-cream)',
        }}
      >
        <video
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        aspectRatio: aspect, width: '100%',
        borderRadius: rounded, overflow: 'hidden',
        background: 'var(--color-cream)',
      }}
    >
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

// Back-compat re-export — existing call sites that import { ImagePlaceholder }
// from this file (or the shim at ImagePlaceholder.tsx) keep working unchanged.
export { MediaPlaceholder as ImagePlaceholder }
