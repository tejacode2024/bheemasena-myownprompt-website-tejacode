import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'

type Props = { children: React.ReactNode; guestAllowed?: boolean }

export function AuthGate({ children, guestAllowed = false }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const mode = useAuthStore((s) => s.mode)

  const isAuthed = mode === 'authed' && !!user
  const allowed  = isAuthed || (guestAllowed && mode === 'guest')

  useEffect(() => {
    if (!allowed) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
    }
  }, [allowed, navigate, location.pathname, location.search])

  if (!allowed) return null
  return <>{children}</>
}
