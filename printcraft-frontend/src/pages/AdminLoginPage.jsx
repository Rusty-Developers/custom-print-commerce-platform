import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Logo from '../components/Logo'
import { isAdmin } from '../utils/jwt'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'

const GOOGLE_CLIENT_ID = '77738261734-9cdvibem3dicur2tl1j5r607uf951mms.apps.googleusercontent.com'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setToken = useStore((s) => s.setToken)

  // Google OAuth state
  const tokenClientRef = useRef(null)
  const [gLoading, setGLoading] = useState(false)
  const [gReady, setGReady] = useState(false)

  // Passphrase state
  const passphraseRef = useRef(null)
  const [passphrase, setPassphrase] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [pLoading, setPLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Shared
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('google') // 'google' | 'pass'

  // If already admin, skip login
  useEffect(() => {
    if (isAdmin()) navigate('/admin', { replace: true })
  }, [navigate])

  // Load Google SDK
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      if (!window.google?.accounts?.oauth2) return
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        error_callback: (err) => {
          setGLoading(false)
          if (err?.type !== 'popup_closed') {
            setError('Sign-in unavailable. Please contact the site owner.')
          }
        },
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setError('Access denied. Unauthorized account.')
            setGLoading(false)
            return
          }
          setError('')
          try {
            const res = await api.post('/api/auth/admin/google', {
              idToken: tokenResponse.access_token,
            })
            const jwt = res.data.Token
            if (!jwt) throw new Error('No token')
            setToken(jwt)
            navigate('/admin', { replace: true })
          } catch {
            setError('Access denied. Unauthorized account.')
          } finally {
            setGLoading(false)
          }
        },
      })
      setGReady(true)
    }
    document.body.appendChild(script)
    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
  }, [navigate, setToken])

  const handleGoogleSignIn = () => {
    if (!gReady || !tokenClientRef.current) return
    setError('')
    setGLoading(true)
    tokenClientRef.current.requestAccessToken()
  }

  const handlePassphrase = async (e) => {
    e.preventDefault()
    if (!passphrase.trim() || attempts >= 5) return
    setPLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/admin/passphrase', { passphrase })
      const jwt = res.data.Token
      if (!jwt) throw new Error('No token')
      setToken(jwt)
      navigate('/admin', { replace: true })
    } catch {
      const next = attempts + 1
      setAttempts(next)
      setPassphrase('')
      passphraseRef.current?.focus()
      setError(next >= 5
        ? 'Too many failed attempts. Try again later.'
        : `Incorrect passphrase. ${5 - next} attempt${5 - next !== 1 ? 's' : ''} remaining.`
      )
    } finally {
      setPLoading(false)
    }
  }

  const locked = attempts >= 5

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #080808 0%, #0e0808 40%, #1a0808 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(139,0,0,0.28) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', top: -200, left: -200, width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'light-drift 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, right: -200, width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,0,0,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'light-drift 16s ease-in-out infinite reverse',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(20,12,12,0.80)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(192,57,43,0.20)',
        borderTop: '2px solid rgba(192,57,43,0.55)',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03)',
        padding: '48px 40px 40px',
        position: 'relative',
        animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Top glow */}
        <div style={{
          position: 'absolute', top: -1, left: '25%', right: '25%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.7), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Logo + badge */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <Logo size={32} />
          <div style={{ marginTop: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 100, padding: '4px 14px',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              color: 'rgba(255,160,160,0.85)', textTransform: 'uppercase',
            }}>🔐 Admin Portal</span>
          </div>
          <h1 style={{
            color: 'white', fontFamily: 'var(--font-heading)',
            fontSize: 26, fontWeight: 800, margin: '14px 0 6px',
            letterSpacing: '-0.02em',
          }}>Admin Access</h1>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, margin: 0, lineHeight: 1.55 }}>
            Sign in to manage MK Group Printing
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, padding: 3, marginBottom: 28, gap: 2,
        }}>
          {[
            { key: 'google', label: 'Google' },
            { key: 'pass', label: 'Passphrase' },
          ].map(({ key, label }) => (
            <button key={key} type="button"
              onClick={() => { setActiveTab(key); setError('') }}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === key ? 'rgba(192,57,43,0.35)' : 'transparent',
                color: activeTab === key ? 'rgba(255,200,200,0.95)' : 'rgba(255,255,255,0.38)',
                letterSpacing: '0.02em',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Shared error */}
        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 16,
            background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.28)',
            borderRadius: 8, fontSize: 13, color: 'rgba(255,160,160,0.9)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── Google tab ── */}
        {activeTab === 'google' && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={gLoading || !gReady}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, width: '100%', padding: '13px 20px',
                background: (gLoading || !gReady) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.96)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                fontSize: 14.5, fontWeight: 600,
                color: (gLoading || !gReady) ? 'rgba(255,255,255,0.38)' : '#3c4043',
                cursor: (gLoading || !gReady) ? 'not-allowed' : 'pointer',
                transition: 'all 0.22s ease', letterSpacing: '0.01em',
                boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                if (!gLoading && gReady) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.3)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              {!gReady ? 'Initializing…' : gLoading ? 'Signing in…' : 'Continue with Google'}
            </button>
            <p style={{
              textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.22)',
              marginTop: 14, lineHeight: 1.5,
            }}>
              Only the authorized Google account can access this panel.
            </p>
          </div>
        )}

        {/* ── Passphrase tab ── */}
        {activeTab === 'pass' && (
          <form onSubmit={handlePassphrase} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={passphraseRef}
                id="admin-passphrase"
                type={showPass ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => { setPassphrase(e.target.value); setError('') }}
                placeholder="Enter admin passphrase"
                disabled={pLoading || locked}
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '13px 44px 13px 16px',
                  background: 'rgba(255,255,255,0.07)',
                  border: `1.5px solid ${error ? 'rgba(192,57,43,0.7)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 10, fontSize: 14.5,
                  color: 'rgba(255,255,255,0.9)', outline: 'none',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: showPass ? '0.02em' : '0.15em',
                  transition: 'border-color 180ms ease, box-shadow 180ms ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(192,57,43,0.55)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.10)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = error ? 'rgba(192,57,43,0.7)' : 'rgba(255,255,255,0.12)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.32)',
                  cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit"
              disabled={pLoading || locked || !passphrase.trim()}
              style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: 10,
                fontSize: 14.5, fontWeight: 700, letterSpacing: '0.03em',
                background: (!pLoading && !locked && passphrase.trim())
                  ? 'linear-gradient(135deg, #C0392B, #8B0000)'
                  : 'rgba(192,57,43,0.20)',
                color: (!pLoading && !locked && passphrase.trim())
                  ? 'white' : 'rgba(255,255,255,0.28)',
                cursor: (!pLoading && !locked && passphrase.trim()) ? 'pointer' : 'not-allowed',
                transition: 'all 0.22s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: (!pLoading && !locked && passphrase.trim())
                  ? '0 4px 20px rgba(192,57,43,0.4)' : 'none',
              }}
            >
              {pLoading ? <Spinner size="sm" white /> : locked ? '🔒 Locked' : 'Access Admin Panel →'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 28, paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.20)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, letterSpacing: '0.02em' }}>
            Secured access — all attempts are logged
          </span>
        </div>
      </div>
    </div>
  )
}
