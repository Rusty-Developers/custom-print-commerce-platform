import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'
import useSeo from '../hooks/useSeo'

export default function LoginPage() {
  useSeo(
    'Login — MK GROUP Printing',
    'Log in to your MK GROUP Printing account to view orders, track deliveries, and manage your profile.'
  )
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notRegistered, setNotRegistered] = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t) }, [])

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
      const msg = (err.response?.data?.message || err.response?.data || '').toString().toLowerCase()
      if (status === 429 || msg.includes('rate') || msg.includes('limit') || msg.includes('too many')) {
        toast.error('Too many OTP requests. Try again in 10 minutes.')
      } else {
        // For ALL other failures (404, 400, 500, network issues, unregistered number, etc.)
        // show the persistent "create your account" callout — this is a login page,
        // so the most likely reason OTP fails is the number isn't registered.
        setNotRegistered(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-cinema">
      {/* Cinematic background */}
      <div className="auth-bg-cinema" />

      <div className={`auth-panel-cinema${mounted ? ' auth-panel--visible' : ''}`}>
        {/* Left decorative strip */}
        <div className="auth-deco-strip" />

        <div className="auth-panel-body">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo-wrap">
              <Logo size={22} />
            </div>
            <h1 className="auth-heading">Welcome Back</h1>
            <p className="auth-subheading">
              Enter your phone number to receive a secure OTP
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSendOtp} noValidate className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-phone">Mobile Number</label>
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input
                  id="login-phone"
                  className={`form-input phone-input${error ? ' error' : ''}`}
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); setNotRegistered(false) }}
                  onBlur={validate}
                  maxLength={10}
                  autoComplete="tel"
                  inputMode="numeric"
                />
              </div>
              {error && <span className="form-error">{error}</span>}

              {/* ── Unregistered number callout ── */}
              {notRegistered && (
                <div className="not-registered-callout" role="alert">
                  <div className="nrc-icon">🙋</div>
                  <div className="nrc-body">
                    <p className="nrc-title">No account found for this number</p>
                    <p className="nrc-desc">Looks like you haven't signed up yet. Create a free account to get started!</p>
                    <Link to={`/register?phone=${phone}`} className="nrc-cta-btn">
                      Create Account →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full auth-submit-btn"
              id="send-otp-btn"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" white /> : <>Send OTP <span style={{ marginLeft: 4 }}>→</span></>}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">NEW HERE?</span>
            <div className="auth-divider-line" />
          </div>

          <Link to="/register" className="auth-alt-btn">
            Create a Free Account
          </Link>

          <p className="auth-footnote">
            🔒 Your number is secured with end-to-end OTP encryption
          </p>
        </div>
      </div>
    </div>
  )
}
