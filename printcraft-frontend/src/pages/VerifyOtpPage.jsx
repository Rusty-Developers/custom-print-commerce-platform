import { useState, useEffect, useRef, useCallback } from 'react'
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
  const phone = searchParams.get('phone') || ''
  const redirect = searchParams.get('redirect') || '/'

  const setToken = useStore((s) => s.setToken)

  const [digits, setDigits]       = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading]     = useState(false)
  const [shake, setShake]         = useState(false)
  const [timer, setTimer]         = useState(TIMER_SECS)
  const [attempts, setAttempts]   = useState(0)
  const inputsRef = useRef([])

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
      toast.success('Login successful! Welcome to MK Group Printing 🎉')
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <Logo size={24} />
          <h1 className="auth-title" style={{ marginTop: 20 }}>Verify OTP</h1>
          <p className="auth-subtitle">
            Sent to <strong>+91 {phone}</strong>&nbsp;
            <Link to="/login" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Change</Link>
          </p>
        </div>
        <div className="auth-card-body">
          <form onSubmit={handleVerify} noValidate>
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
                />
              ))}
            </div>

            {/* Timer */}
            <div className="otp-timer">
              {timer > 0 ? (
                <>OTP expires in <strong>{formatTimer(timer)}</strong></>
              ) : (
                <span className="otp-resend" onClick={handleResend}>Resend OTP →</span>
              )}
            </div>

            {attempts >= 5 && (
              <div style={{ textAlign: 'center', color: 'var(--primary)', fontSize: 13, marginBottom: 12 }}>
                Too many wrong attempts.{' '}
                <span className="otp-resend" onClick={handleResend}>Request a new OTP</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              id="verify-otp-btn"
              disabled={loading || attempts >= 5}
              style={{ marginTop: 8 }}
            >
              {loading ? <Spinner size="sm" white /> : 'Verify OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
