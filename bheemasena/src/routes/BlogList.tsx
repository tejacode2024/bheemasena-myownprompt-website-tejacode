import { Link } from 'react-router-dom'
import { BLOG } from '../data/blog'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'
import { Footer } from '../components/layout/Footer'

export default function BlogList() {
  return (
    <main>
      <section
        style={{
          padding: 'clamp(120px,12vw,180px) clamp(24px,6vw,96px) 64px',
          maxWidth: 1280, margin: '0 auto',
        }}
      >
        <span className="eyebrow">JOURNAL</span>
        <h1 style={{
          margin: '16px 0 48px',
          fontSize: 'clamp(40px,6vw,72px)',
          fontWeight: 400, lineHeight: 1.0,
          color: 'var(--color-ink)',
        }}>
          Stories from <span className="heading-em">the Kitchen</span>
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
            gap: 32,
          }}
          className="blog-list-grid"
        >
          {BLOG.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`}>
              <ImagePlaceholder aspect="16/9" />
              <div style={{
                marginTop: 16,
                fontSize: 10, letterSpacing: '0.25em',
                color: 'var(--color-muted)', textTransform: 'uppercase',
              }}>
                {new Date(p.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <h2 style={{
                margin: '8px 0 0', fontSize: 22, fontWeight: 400,
                color: 'var(--color-ink)', lineHeight: 1.25,
              }}>
                {p.title}
              </h2>
              <p style={{
                margin: '12px 0 0', fontSize: 13, lineHeight: 1.6,
                color: 'var(--color-muted)', textTransform: 'none',
              }}>
                {p.excerpt}
              </p>
              <div style={{
                marginTop: 12, fontSize: 12,
                color: 'var(--color-accent)', letterSpacing: '0.10em',
              }}>
                Read more →
              </div>
            </Link>
          ))}
        </div>

        <style>{`
          @media (max-width: 1024px) { .blog-list-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
          @media (max-width: 640px)  { .blog-list-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      <Footer />
    </main>
  )
}
