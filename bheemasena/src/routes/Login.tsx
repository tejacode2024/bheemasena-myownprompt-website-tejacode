import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../state/authStore'
import { useUIStore } from '../state/uiStore'
import { usePrefersReducedMotion } from '../lib/format'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/'

  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const setGuest         = useAuthStore((s) => s.setGuest)
  const toast            = useUIStore((s) => s.toast)
  const openCart         = useUIStore((s) => s.openCart)

  const reduced = usePrefersReducedMotion()
  const [busy, setBusy] = useState<'google' | 'guest' | null>(null)

  const goNext = () => {
    const url = new URL(next, window.location.origin)
    const cartOpen = url.searchParams.get('cart') === 'open'
    url.searchParams.delete('cart')
    const pathWithSearch = url.pathname + (url.search ? url.search : '') + url.hash
    navigate(pathWithSearch || '/')
    if (cartOpen) setTimeout(() => openCart(), 200)
  }

  const handleGoogle = async () => {
    setBusy('google')
    try {
      await signInWithGoogle()
      toast('Signed in. Welcome back.', 'success')
      goNext()
    } catch {
      toast('Sign-in failed. Try again.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleGuest = () => {
    setBusy('guest')
    setGuest()
    toast('Browsing as guest.', 'info')
    goNext()
  }

  useEffect(() => {
    document.documentElement.style.background = '#000'
    return () => { document.documentElement.style.background = '' }
  }, [])

  return (
    <main style={{
      position: 'relative',
      minHeight: '100svh',
      overflow: 'hidden',
    }}>
      {reduced ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImagePlaceholder aspect="16/9" label="login" />
        </div>
      ) : (
        <video
          autoPlay loop muted playsInline preload="metadata"
          aria-hidden="true"
          src="/videos/login-page-video.mp4"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(14,14,12,0.55) 0%, rgba(14,14,12,0.35) 50%, rgba(14,14,12,0.70) 100%)',
        }}
      />

      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100svh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          maxWidth: 420, width: '100%',
          color: 'var(--color-cream)', textAlign: 'center',
        }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 36, letterSpacing: '0.04em', lineHeight: 1.0 }}>Bheemasena</div>
            <div style={{
              fontSize: 14, fontStyle: 'italic',
              color: 'rgba(246,242,236,0.70)', letterSpacing: '0.18em',
              marginTop: 4,
            }}>Royal Feast</div>
          </div>

          <h1 style={{
            margin: '0 0 12px',
            fontSize: 28, fontWeight: 400, lineHeight: 1.2,
          }}>
            Welcome to <span className="heading-em">Bheemasena</span>
          </h1>

          <p style={{
            marginBottom: 40,
            fontSize: 13,
            color: 'rgba(246,242,236,0.70)',
            textTransform: 'none', lineHeight: 1.6,
          }}>
            Sign in to save addresses, place orders, and track your meals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              type="button"
              className="pill-btn pill-primary on-dark"
              onClick={handleGoogle}
              disabled={busy !== null}
            >
              <GoogleG />
              {busy === 'google' ? 'SIGNING IN…' : 'CONTINUE WITH GOOGLE →'}
            </button>
            <button
              type="button"
              className="pill-btn pill-secondary on-dark"
              onClick={handleGuest}
              disabled={busy !== null}
            >
              CONTINUE AS GUEST →
            </button>
          </div>

          <p style={{
            marginTop: 32, fontSize: 10,
            color: 'rgba(246,242,236,0.45)',
            textTransform: 'none', lineHeight: 1.5,
          }}>
            By continuing, you agree to our Privacy Policy and Terms.
          </p>
        </div>
      </div>
    </main>
  )
}

function GoogleG() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.18c-.27 1.43-1.07 2.64-2.28 3.45v2.87h3.68C21.65 18.7 23 15.77 23 12.27z"/>
      <path fill="#34A853" d="M12 23c3.08 0 5.66-1.02 7.55-2.78l-3.68-2.87c-1.02.68-2.32 1.09-3.87 1.09-2.97 0-5.49-2.01-6.39-4.72H1.82v2.96A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.61 13.72A6.6 6.6 0 0 1 5.27 12c0-.6.1-1.19.34-1.72V7.32H1.82A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.43-2.96.0-.26z"/>
      <path fill="#EA4335" d="M12 5.55c1.68 0 3.18.58 4.36 1.71l3.27-3.27C17.65 2.06 15.08 1 12 1A11 11 0 0 0 1.82 7.32l3.79 2.96C6.51 7.56 9.03 5.55 12 5.55z"/>
    </svg>
  )
}
