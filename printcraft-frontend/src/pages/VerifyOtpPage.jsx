import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useStore from '../store/useStore'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'

const OTP_LENGTH = 6
const TIMER_SECS = 300 // 5 minutes

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone    = searchParams.get('phone') || ''
  const redirect = searchParams.get('redirect') || '/'

  const setToken = useStore((s) => s.setToken)

  const [digits, setDigits]     = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading]   = useState(false)
  const [shake, setShake]       = useState(false)
  const [timer, setTimer]       = useState(TIMER_SECS)
  const [attempts, setAttempts] = useState(0)
  const [mounted, setMounted]   = useState(false)
  const inputsRef = useRef([])

  useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t) }, [])

  // Countdown
  useEffect(() => {
    if (timer <= 0) return
    const t = setInterval(() => setTimer((p) => p - 1), 1000)
    return () => clearInterval(t)
  }, [timer])

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleDigitChange = (idx, val) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = clean
    setDigits(next)
    if (clean && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted.length === OTP_LENGTH) {
      setDigits(pasted.split(''))
      inputsRef.current[OTP_LENGTH - 1]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < OTP_LENGTH) { toast.error('Enter the complete 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-otp', { phoneno: phone, otp })
      const token = res.data.token
      setToken(token)
      toast.success('Login successful! Welcome to MK GROUP Printing 🎉')
      navigate(redirect, { replace: true })
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setDigits(Array(OTP_LENGTH).fill(''))
      inputsRef.current[0]?.focus()

      if (newAttempts >= 5) {
        toast.error('Too many wrong attempts. Please request a new OTP.')
      } else {
        const msg = err.response?.data?.message || ''
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          toast.error('Invalid OTP. Please check and try again.')
        } else {
          toast.error('Incorrect OTP. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/api/auth/send-otp', { phoneno: phone })
      toast.success('New OTP sent!')
      setTimer(TIMER_SECS)
      setAttempts(0)
      setDigits(Array(OTP_LENGTH).fill(''))
    } catch {
      toast.error('Failed to resend OTP. Try again.')
    }
  }

  const filled = digits.filter(Boolean).length

  return (
    <div className="auth-page-cinema">
      <div className="auth-bg-cinema" />

      <div className={`auth-panel-cinema${mounted ? ' auth-panel--visible' : ''}`}>
        <div className="auth-deco-strip" />

        <div className="auth-panel-body">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo-wrap">
              <Logo size={22} />
            </div>
            <h1 className="auth-heading">Verify OTP</h1>
            <p className="auth-subheading">
              Sent to <strong style={{ color: 'var(--text-dark)' }}>+91 {phone}</strong>&nbsp;
              <Link to="/login" style={{ color: 'var(--primary)', fontSize: '12.5px', fontWeight: 700 }}>Change</Link>
            </p>
          </div>

          {/* Progress bar */}
          <div className="otp-progress-bar">
            <div
              className="otp-progress-fill"
              style={{ width: `${(filled / OTP_LENGTH) * 100}%` }}
            />
          </div>

          <form onSubmit={handleVerify} noValidate>
            {/* OTP Inputs */}
            <div className={`otp-inputs${shake ? ' shake' : ''}`} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  id={`otp-input-${i}`}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  disabled={attempts >= 5}
                  aria-label={`OTP digit ${i + 1}`}
                  style={{
                    background: d ? 'linear-gradient(135deg, #fff5f5, #fff)' : 'var(--white)',
                    borderColor: d ? 'var(--primary)' : undefined,
                    boxShadow: d ? '0 0 0 2px rgba(192,57,43,0.08)' : undefined,
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="otp-timer" style={{ marginBottom: 8 }}>
              {timer > 0 ? (
                <>
                  <span style={{ fontSize: 12 }}>OTP expires in</span>{' '}
                  <strong style={{ color: timer < 60 ? 'var(--primary)' : 'var(--text-dark)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatTimer(timer)}
                  </strong>
                </>
              ) : (
                <span className="otp-resend" onClick={handleResend}>↺ Resend OTP</span>
              )}
            </div>

            {attempts >= 5 && (
              <div style={{ textAlign: 'center', color: 'var(--primary)', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
                Too many wrong attempts.{' '}
                <span className="otp-resend" onClick={handleResend}>Request a new OTP</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full auth-submit-btn"
              id="verify-otp-btn"
              disabled={loading || attempts >= 5 || filled < OTP_LENGTH}
            >
              {loading ? <Spinner size="sm" white /> : 'Verify & Login'}
            </button>
          </form>

          <p className="auth-footnote">
            🔒 Your OTP is valid for 5 minutes only
          </p>
        </div>
      </div>
    </div>
  )
}
