import { Link, Navigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { BLOG } from '../data/blog'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'
import { Footer } from '../components/layout/Footer'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = BLOG.find((p) => p.slug === slug)

  if (!post) return <Navigate to="/blog" replace />

  return (
    <main>
      <article
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 'clamp(120px,12vw,180px) clamp(24px,6vw,40px) 64px',
        }}
      >
        <ImagePlaceholder aspect="16/9" />

        <div style={{
          marginTop: 24,
          fontSize: 10, letterSpacing: '0.25em',
          color: 'var(--color-muted)', textTransform: 'uppercase',
        }}>
          {new Date(post.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}Bheemasena Kitchen
        </div>

        <h1 style={{
          margin: '12px 0 24px',
          fontSize: 'clamp(36px,5vw,64px)',
          fontWeight: 400, lineHeight: 1.05,
          color: 'var(--color-ink)',
        }}>
          {post.title}
        </h1>

        <div className="blog-body" style={{ color: 'var(--color-ink)' }}>
          <ReactMarkdown
            components={{
              p:  ({ ...props }) => <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 20, textTransform: 'none' }} {...props} />,
              h2: ({ ...props }) => <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 22, fontWeight: 400, textTransform: 'none', letterSpacing: '0.02em' }} {...props} />,
              h3: ({ ...props }) => <h3 style={{ marginTop: 24, marginBottom: 10, fontSize: 18, fontWeight: 400, textTransform: 'none' }} {...props} />,
              ul: ({ ...props }) => <ul style={{ paddingLeft: 20, marginBottom: 20, fontSize: 16, lineHeight: 1.7, textTransform: 'none' }} {...props} />,
              li: ({ ...props }) => <li style={{ marginBottom: 6 }} {...props} />,
              strong: ({ ...props }) => <strong style={{ color: 'var(--color-ink)' }} {...props} />,
              em: ({ ...props }) => <em {...props} />,
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        <div style={{ marginTop: 48 }}>
          <Link to="/blog" className="pill-btn pill-ghost">← Back to all stories</Link>
        </div>
      </article>

      <Footer />
    </main>
  )
}
