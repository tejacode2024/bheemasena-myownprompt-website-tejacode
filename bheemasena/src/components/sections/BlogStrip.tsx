import { Link } from 'react-router-dom'
import { BLOG } from '../../data/blog'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'

export function BlogStrip() {
  const posts = BLOG.slice(0, 2)

  return (
    <section
      aria-labelledby="blog-heading"
      style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px)',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">BLOG</span>
        <h2
          id="blog-heading"
          style={{
            margin: '16px 0 0',
            fontSize: 'clamp(36px,5vw,64px)',
            fontWeight: 400,
            lineHeight: 1.05,
            color: 'var(--color-ink)',
          }}
        >
          Flavors & Insights —&nbsp;<span className="heading-em">A Culinary Journey</span>
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
        }}
        className="blog-strip-grid"
      >
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} style={{ display: 'block' }}>
            <ImagePlaceholder aspect="16/9" />
            <div style={{
              marginTop: 20,
              fontSize: 10, letterSpacing: '0.25em',
              color: 'var(--color-muted)', textTransform: 'uppercase',
            }}>
              {new Date(p.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <h3 style={{
              margin: '8px 0 0', fontSize: 22, fontWeight: 400,
              color: 'var(--color-ink)', lineHeight: 1.25,
            }}>
              {p.title}
            </h3>
            <p style={{
              margin: '12px 0 0', fontSize: 13, lineHeight: 1.6,
              color: 'var(--color-muted)', textTransform: 'none',
            }}>
              {p.excerpt}
            </p>
            <div style={{
              marginTop: 16,
              fontSize: 12, color: 'var(--color-accent)',
              letterSpacing: '0.10em',
            }}>
              Read more →
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Link to="/blog" className="pill-btn pill-ghost">SEE ALL ARTICLES →</Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .blog-strip-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
