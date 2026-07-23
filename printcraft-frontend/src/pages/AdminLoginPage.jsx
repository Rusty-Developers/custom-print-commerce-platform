import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Logo from '../components/Logo'
import { isAdmin } from '../utils/jwt'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'

// ── The ONLY Google client ID for this app ────────────────────────────────────
const GOOGLE_CLIENT_ID =
  '280935553138-9l8a389kma480vag3oetuf82565i2ppo.apps.googleusercontent.com'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setToken = useStore((s) => s.setToken)

  const btnDivRef = useRef(null)   // Google's rendered button mounts here
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Skip login if already an admin
  useEffect(() => {
    if (isAdmin()) navigate('/admin', { replace: true })
  }, [navigate])

  // Entrance animation trigger
  useEffect(() => { setMounted(true) }, [])

  // ── Credential callback (called by Google with an ID token) ─────────────────
  const handleCredential = useCallback(async (response) => {
    const idToken = response?.credential
    if (!idToken) {
      setError('Google sign-in failed. Please try again.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/admin/google', { idToken })
      const jwt = res.data.Token
      if (!jwt) throw new Error('No token received')
      setToken(jwt)
      navigate('/admin', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.status === 401 || err?.response?.status === 403
          ? 'Access denied. This Google account is not authorised.'
          : 'Sign-in failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [navigate, setToken])

  // ── Load Google Identity Services SDK & initialise ──────────────────────────
  useEffect(() => {
    // Expose callback on window BEFORE the SDK loads
    window.__adminGoogleCallback = handleCredential

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: window.__adminGoogleCallback,
        // auto_select: false — admin must explicitly click
        auto_select: false,
        // ux_mode: 'popup' keeps everything in a modal — no redirect
        ux_mode: 'popup',
      })

      setSdkReady(true)
    }

    script.onerror = () => {
      setError('Could not load Google Sign-In. Check your internet connection.')
    }

    document.body.appendChild(script)
    return () => {
      // Cleanup — cancel any pending One Tap prompt
      window.google?.accounts?.id?.cancel?.()
      if (script.parentNode) script.parentNode.removeChild(script)
      delete window.__adminGoogleCallback
    }
  }, [handleCredential])

  // ── Render Google button once SDK is ready ──────────────────────────────────
  useEffect(() => {
    if (!sdkReady || !btnDivRef.current) return
    window.google.accounts.id.renderButton(btnDivRef.current, {
      theme: 'filled_black',   // matches dark card background
      size: 'large',
      width: 320,              // matches card inner width
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    })
  }, [sdkReady])

  // ── Manual trigger (for "Sign in with Google" text button as fallback) ───────
  const handleManualSignIn = useCallback(() => {
    if (!sdkReady || loading) return
    setError('')
    // prompt() shows the One Tap / account-chooser popup
    window.google.accounts.id.prompt((notification) => {
      if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
        // Silently ignore — user closed popup or it was skipped
      }
    })
  }, [sdkReady, loading])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #080808 0%, #0e0808 40%, #1a0808 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes admin-fade-up {
          from { opacity:0; transform:translateY(22px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes admin-glow-drift {
          0%,100% { transform:translate(0,0)       scale(1);   }
          50%     { transform:translate(40px,30px) scale(1.1); }
        }
        @keyframes admin-glow-pulse {
          0%,100% { opacity:0.28; }
          50%     { opacity:0.46; }
        }
        /* Override Google button border-radius to match card style */
        #admin-google-btn > div {
          border-radius: 10px !important;
          overflow: hidden !important;
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(139,0,0,0.28) 0%, transparent 70%)',
        animation: 'admin-glow-pulse 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: -200, left: -200, width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'admin-glow-drift 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, right: -200, width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,0,0,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'admin-glow-drift 16s ease-in-out infinite reverse',
      }} />

      {/* ── Card ── */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(20,12,12,0.82)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(192,57,43,0.20)',
        borderTop: '2px solid rgba(192,57,43,0.55)',
        borderRadius: 22,
        boxShadow: '0 32px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.03)',
        padding: '48px 40px 44px',
        position: 'relative',
        animation: mounted ? 'admin-fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both' : 'none',
      }}>

        {/* Top shimmer line */}
        <div style={{
          position: 'absolute', top: -1, left: '20%', right: '20%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.75), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Logo + badge */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Logo size={32} />
          <div style={{ marginTop: 18 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(192,57,43,0.14)',
              border: '1px solid rgba(192,57,43,0.28)',
              borderRadius: 100,
              padding: '4px 14px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.13em',
              color: 'rgba(255,160,160,0.85)',
              textTransform: 'uppercase',
            }}>🔐 Admin Portal</span>
          </div>
          <h1 style={{
            color: 'white',
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 800,
            margin: '14px 0 6px',
            letterSpacing: '-0.02em',
          }}>Admin Access</h1>
          <p style={{
            color: 'rgba(255,255,255,0.40)',
            fontSize: 13.5,
            margin: 0,
            lineHeight: 1.55,
          }}>
            Sign in with the authorised Google account
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            padding: '10px 14px',
            marginBottom: 18,
            background: 'rgba(192,57,43,0.12)',
            border: '1px solid rgba(192,57,43,0.30)',
            borderRadius: 9,
            fontSize: 13,
            color: 'rgba(255,160,160,0.92)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            lineHeight: 1.45,
          }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Google Button (rendered by Google SDK) ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* SDK renders the official Google button inside this div */}
          <div
            id="admin-google-btn"
            ref={btnDivRef}
            style={{
              width: '100%',
              minHeight: 44,
              display: sdkReady && !loading ? 'block' : 'none',
            }}
          />

          {/* Loading / initialising state */}
          {(!sdkReady || loading) && (
            <div style={{
              width: '100%',
              padding: '13px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              color: 'rgba(255,255,255,0.35)',
              fontSize: 14,
            }}>
              <Spinner size="sm" />
              <span>{loading ? 'Signing in…' : 'Loading Google Sign-In…'}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '22px 0 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, letterSpacing: '0.06em' }}>
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Manual prompt button (fallback if rendered button doesn't suit) */}
        <button
          type="button"
          onClick={handleManualSignIn}
          disabled={!sdkReady || loading}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '11px 20px',
            background: 'transparent',
            border: `1.5px solid ${sdkReady && !loading ? 'rgba(192,57,43,0.45)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            color: sdkReady && !loading ? 'rgba(255,200,200,0.85)' : 'rgba(255,255,255,0.25)',
            cursor: sdkReady && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={(e) => {
            if (sdkReady && !loading) {
              e.currentTarget.style.background = 'rgba(192,57,43,0.10)'
              e.currentTarget.style.borderColor = 'rgba(192,57,43,0.65)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = sdkReady && !loading
              ? 'rgba(192,57,43,0.45)' : 'rgba(255,255,255,0.08)'
          }}
        >
          Choose a Google account →
        </button>

        {/* Footer */}
        <div style={{
          marginTop: 26,
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{
            color: 'rgba(255,255,255,0.16)',
            fontSize: 11,
            letterSpacing: '0.025em',
          }}>
            Only the authorised Google account can access this panel
          </span>
        </div>
      </div>
    </div>
  )
}
