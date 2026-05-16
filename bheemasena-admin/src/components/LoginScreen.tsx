import { useState, useRef, useEffect } from 'react'
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import { Divider } from './ui/Divider'
import { Spinner } from './ui/Spinner'
import { useAdminStore } from '../state/adminStore'

export function LoginScreen() {
  const login = useAdminStore(s => s.login)
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(pwd)
    setBusy(false)
    if (!ok) {
      setError('Incorrect admin password.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div
      style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--color-admin-bg)',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.05 0 0 0 0 0.05 0 0 0 0.03 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    >
      <div
        ref={cardRef}
        className={`admin-card ${shake ? 'bhm-shake' : ''}`}
        style={{ width: '100%', maxWidth: 360, padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 22, letterSpacing: '0.06em', color: 'var(--color-ink)' }}>Bheemasena</div>
          <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--color-muted)' }}>
            Royal Feast · Admin Portal
          </div>
        </div>

        <Divider />

        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 18, color: 'var(--color-ink)' }}>Sign in</div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
            Access restricted to authorised staff.
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <label className="admin-label" htmlFor="adminPwd">Admin password</label>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Lock
              size={14}
              style={{ position: 'absolute', top: 17, left: 14, color: 'var(--color-muted)', pointerEvents: 'none' }}
            />
            <input
              id="adminPwd"
              ref={inputRef}
              type={show ? 'text' : 'password'}
              className="admin-input"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setError('') }}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              style={{ paddingLeft: 38, paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              aria-label={show ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', top: 12, right: 8, width: 24, height: 24,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-muted)',
              }}
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <div role="alert" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--color-accent)', fontSize: 11, marginBottom: 12,
            }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <button type="submit" className="pill-btn pill-primary" style={{ width: '100%', height: 44 }} disabled={busy}>
            {busy ? <Spinner size={14} /> : <>Sign in →</>}
          </button>
        </form>
      </div>

      <a
        href="/"
        style={{
          position: 'fixed', bottom: 20, left: 0, right: 0, textAlign: 'center',
          color: 'var(--color-muted)', fontSize: 11, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center',
        }}
      >
        <ArrowLeft size={11} /> Back to Bheemasena
      </a>
    </div>
  )
}
