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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <Logo size={24} />
          <h1 className="auth-title" style={{ marginTop: 20 }}>Welcome Back</h1>
          <p className="auth-subtitle">Enter your phone number to receive an OTP</p>
        </div>
        <div className="auth-card-body">
          <form onSubmit={handleSendOtp} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-phone">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 14, color: 'var(--text-muted)', fontWeight: 600,
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
                  style={{ paddingLeft: 44 }}
                />
              </div>
              {error && <span className="form-error">{error}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" id="send-otp-btn" disabled={loading}>
              {loading ? <Spinner size="sm" white /> : 'Send OTP →'}
            </button>
          </form>

          <div className="auth-footer-link">
            New here?{' '}
            <Link to="/register">Register →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
