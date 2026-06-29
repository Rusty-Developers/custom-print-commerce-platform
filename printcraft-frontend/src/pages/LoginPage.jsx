import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'

export default function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number')
      return false
    }
    setError('')
    return true
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/api/auth/send-otp', { phoneno: phone })
      toast.success('OTP sent successfully!')
      navigate(`/verify-otp?phone=${phone}`)
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.message || ''
      if (status === 429 || msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('limit')) {
        toast.error('Too many OTP requests. Try again in 10 minutes.')
      } else if (status === 404) {
        toast.error('Phone number not registered. Please sign up first.')
      } else {
        toast.error('Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-cinema">
      {/* Cinematic background */}
      <div className="auth-bg-cinema" />

      <div className="auth-panel-cinema">
        {/* Left decorative strip */}
        <div className="auth-deco-strip" />

        <div style={{ padding: '44px 44px 40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Logo size={28} />
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800,
              marginTop: 18, marginBottom: 6, color: 'var(--text-dark)',
              letterSpacing: '-0.02em',
            }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Enter your phone number to receive a secure OTP
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSendOtp} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-phone">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 14, color: 'var(--text-muted)', fontWeight: 700,
                  borderRight: '1.5px solid rgba(0,0,0,0.1)', paddingRight: 10,
                  lineHeight: 1,
                }}>+91</span>
                <input
                  id="login-phone"
                  className={`form-input${error ? ' error' : ''}`}
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError('') }}
                  onBlur={validate}
                  maxLength={10}
                  autoComplete="tel"
                  style={{ paddingLeft: 58 }}
                />
              </div>
              {error && <span className="form-error">{error}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              id="send-otp-btn"
              disabled={loading}
              style={{ padding: '14px 28px', fontSize: 14.5, marginTop: 4 }}
            >
              {loading ? <Spinner size="sm" white /> : <>Send OTP <span style={{ marginLeft: 4 }}>→</span></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '24px 0', color: 'var(--text-light)', fontSize: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
            <span>NEW HERE?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
          </div>

          <Link
            to="/register"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '13px 28px',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
              color: 'var(--text-dark)', textDecoration: 'none',
              transition: 'border-color 180ms ease, color 180ms ease, background 180ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.color = 'var(--text-dark)'
            }}
          >
            Create a Free Account
          </Link>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-light)', marginTop: 24 }}>
            🔒 Your number is secured with end-to-end OTP encryption
          </p>
        </div>
      </div>
    </div>
  )
}
