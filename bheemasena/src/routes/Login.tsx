import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../state/authStore'
import { useUIStore } from '../state/uiStore'
import { usePrefersReducedMotion } from '../lib/format'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'

type Step = 'email' | 'otp' | 'password' | 'register'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/'

  const setGuest    = useAuthStore((s) => s.setGuest)
  const sendOtp     = useAuthStore((s) => s.sendOtp)
  const verifyOtp   = useAuthStore((s) => s.verifyOtp)
  const loginAction = useAuthStore((s) => s.login)
  const register    = useAuthStore((s) => s.register)
  const toast       = useUIStore((s) => s.toast)
  const openCart    = useUIStore((s) => s.openCart)

  const reduced = usePrefersReducedMotion()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const goNext = () => {
    const url = new URL(next, window.location.origin)
    const cartOpen = url.searchParams.get('cart') === 'open'
    url.searchParams.delete('cart')
    const pathWithSearch = url.pathname + (url.search ? url.search : '') + url.hash
    navigate(pathWithSearch || '/')
    if (cartOpen) setTimeout(() => openCart(), 200)
  }

  const handleGuest = () => {
    setGuest()
    toast('Browsing as guest.', 'info')
    goNext()
  }

  const handleSendOtp = async () => {
    setErr('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr('Please enter a valid email.'); return
    }
    setBusy(true)
    try {
      await sendOtp(email.trim())
      setStep('otp')
    } catch (e: any) {
      setErr(e?.message || 'Could not send OTP. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    try {
      await sendOtp(email.trim())
      toast('OTP resent', 'success')
    } catch (e: any) {
      toast(e?.message || 'Could not resend OTP', 'error')
    }
  }

  const handleVerify = async () => {
    setErr('')
    if (otp.length !== 6) { setErr('Enter the 6-digit code.'); return }
    setBusy(true)
    try {
      const { isNewUser } = await verifyOtp(email.trim(), otp)
      setStep(isNewUser ? 'register' : 'password')
      setOtp('')
    } catch (e: any) {
      setErr(e?.message || 'Could not verify OTP.')
    } finally {
      setBusy(false)
    }
  }

  const handleLogin = async () => {
    setErr('')
    setBusy(true)
    try {
      await loginAction(email.trim(), password)
      toast('Welcome back', 'success')
      goNext()
    } catch (e: any) {
      setErr(e?.message || 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async () => {
    setErr('')
    if (!name.trim() || !phone.trim() || password.length < 4) {
      setErr('Please complete every field (password ≥ 4 chars).'); return
    }
    setBusy(true)
    try {
      await register(email.trim(), name.trim(), phone.trim(), password)
      toast('Account created', 'success')
      goNext()
    } catch (e: any) {
      setErr(e?.message || 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  const goBack = () => {
    setErr('')
    if (step === 'otp') setStep('email')
    else if (step === 'password' || step === 'register') setStep('otp')
  }

  useEffect(() => {
    document.documentElement.style.background = '#000'
    return () => { document.documentElement.style.background = '' }
  }, [])

  return (
    <main style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden' }}>
      {reduced ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImagePlaceholder aspect="16/9" label="login" />
        </div>
      ) : (
        <video
          autoPlay loop muted playsInline preload="metadata"
          aria-hidden="true"
          src="/videos/login-page-video.mp4"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
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
          position: 'relative',
        }}>
          {step !== 'email' && (
            <button
              type="button"
              aria-label="Go back"
              onClick={goBack}
              style={{
                position: 'absolute', top: -4, left: 0,
                width: 36, height: 36, borderRadius: '50%',
                background: 'transparent',
                border: '1px solid rgba(246,242,236,0.20)',
                color: 'var(--color-cream)',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
            </button>
          )}

          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 36, letterSpacing: '0.04em', lineHeight: 1.0 }}>Bheemasena</div>
            <div style={{
              fontSize: 14, fontStyle: 'italic',
              color: 'rgba(246,242,236,0.70)', letterSpacing: '0.18em', marginTop: 4,
            }}>Royal Feast</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ minHeight: 240 }}
            >
              {step === 'email' && (
                <StepWrap heading="Welcome to Bheemasena" sub="Enter your email to continue.">
                  <DarkInput
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    onEnter={handleSendOtp}
                    autoFocus
                  />
                  {err && <ErrLine msg={err} />}
                  <button
                    type="button"
                    className="pill-btn pill-primary on-dark"
                    style={{ width: '100%', marginTop: 16 }}
                    disabled={busy}
                    onClick={handleSendOtp}
                  >
                    {busy ? 'SENDING OTP…' : 'SEND OTP →'}
                  </button>
                </StepWrap>
              )}

              {step === 'otp' && (
                <StepWrap heading="Check your inbox" sub={`We sent a 6-digit code to ${email}`}>
                  <DarkInput
                    type="text"
                    placeholder="••••••"
                    value={otp}
                    onChange={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                    onEnter={handleVerify}
                    centered
                    autoFocus
                    inputMode="numeric"
                  />
                  {err && <ErrLine msg={err} />}
                  <button
                    type="button"
                    className="pill-btn pill-primary on-dark"
                    style={{ width: '100%', marginTop: 16 }}
                    disabled={busy}
                    onClick={handleVerify}
                  >
                    {busy ? 'VERIFYING…' : 'VERIFY →'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    style={{
                      marginTop: 14,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'rgba(246,242,236,0.55)', fontSize: 11,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Resend OTP
                  </button>
                </StepWrap>
              )}

              {step === 'password' && (
                <StepWrap heading="Welcome back" sub={email}>
                  <DarkInput
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={setPassword}
                    onEnter={handleLogin}
                    autoFocus
                    rightSlot={
                      <button
                        type="button"
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPwd((v) => !v)}
                        style={eyeBtn}
                      >
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    }
                  />
                  {err && <ErrLine msg={err} />}
                  <button
                    type="button"
                    className="pill-btn pill-primary on-dark"
                    style={{ width: '100%', marginTop: 16 }}
                    disabled={busy || !password}
                    onClick={handleLogin}
                  >
                    {busy ? 'SIGNING IN…' : 'SIGN IN →'}
                  </button>
                </StepWrap>
              )}

              {step === 'register' && (
                <StepWrap heading="Create your account" sub="Just a few details to get started.">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <DarkInput
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={setName}
                      autoFocus
                    />
                    <DarkInput
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={setPhone}
                    />
                    <DarkInput
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Password (min 4 characters)"
                      value={password}
                      onChange={setPassword}
                      onEnter={handleRegister}
                      rightSlot={
                        <button
                          type="button"
                          aria-label={showPwd ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPwd((v) => !v)}
                          style={eyeBtn}
                        >
                          {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                  </div>
                  {err && <ErrLine msg={err} />}
                  <button
                    type="button"
                    className="pill-btn pill-primary on-dark"
                    style={{ width: '100%', marginTop: 16 }}
                    disabled={busy}
                    onClick={handleRegister}
                  >
                    {busy ? 'CREATING…' : 'CREATE ACCOUNT →'}
                  </button>
                </StepWrap>
              )}
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            className="pill-btn pill-secondary on-dark"
            style={{ width: '100%', marginTop: 16 }}
            onClick={handleGuest}
          >
            CONTINUE AS GUEST →
          </button>

          <p style={{
            marginTop: 28, fontSize: 10,
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

// ─── small subcomponents ───

function StepWrap({
  heading, sub, children,
}: {
  heading: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <>
      <h1 style={{
        margin: '0 0 6px',
        fontSize: 28, fontWeight: 400, lineHeight: 1.2,
      }}>
        {heading}
      </h1>
      {sub && (
        <p style={{
          marginBottom: 28, fontSize: 13,
          color: 'rgba(246,242,236,0.70)',
          textTransform: 'none', lineHeight: 1.6,
        }}>
          {sub}
        </p>
      )}
      {children}
    </>
  )
}

function DarkInput({
  type = 'text', placeholder, value, onChange, onEnter,
  autoFocus, centered, rightSlot, inputMode,
}: {
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  onEnter?: () => void
  autoFocus?: boolean
  centered?: boolean
  rightSlot?: React.ReactNode
  inputMode?: 'numeric' | 'text'
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter() }}
        autoFocus={autoFocus}
        inputMode={inputMode}
        style={{
          width: '100%',
          height: 48,
          padding: rightSlot ? '0 44px 0 14px' : '0 14px',
          background: 'transparent',
          border: '1px solid rgba(246,242,236,0.35)',
          borderRadius: 4,
          color: 'var(--color-cream)',
          fontFamily: 'inherit',
          fontSize: centered ? 24 : 13,
          letterSpacing: centered ? '0.3em' : '0.01em',
          textAlign: centered ? 'center' : 'left',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(246,242,236,0.35)')}
      />
      {rightSlot && (
        <div style={{ position: 'absolute', top: 0, right: 4, height: 48, display: 'flex', alignItems: 'center' }}>
          {rightSlot}
        </div>
      )}
    </div>
  )
}

function ErrLine({ msg }: { msg: string }) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 10,
        fontSize: 12, color: '#F0A29A',
        letterSpacing: '0.04em', lineHeight: 1.5,
      }}
    >
      {msg}
    </div>
  )
}

const eyeBtn: React.CSSProperties = {
  width: 36, height: 36,
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'rgba(246,242,236,0.65)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
