import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phoneno: '', email: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 5)
      e.name = 'Name must be at least 5 characters'
    if (!/^[6-9][0-9]{9}$/.test(form.phoneno))
      e.phoneno = 'Enter a valid 10-digit Indian mobile number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      toast.success('Account created! Please verify your number.')
      navigate(`/verify-otp?phone=${form.phoneno}`)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || ''
      if (typeof msg === 'string' && msg.toLowerCase().includes('email')) {
        toast.error('Email already registered. Please login.')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }))
  }

  return (
    <div className="auth-page-cinema">
      <div className="auth-bg-cinema" />

      <div className="auth-panel-cinema" style={{ maxWidth: 480 }}>
        <div className="auth-deco-strip" />

        <div style={{ padding: '40px 44px 40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Logo size={28} />
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800,
              marginTop: 18, marginBottom: 6, color: 'var(--text-dark)',
              letterSpacing: '-0.02em',
            }}>
              Create Account
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Join MK Group Printing — your prints await
            </p>
          </div>

          {/* Steps indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginBottom: 28,
          }}>
            {['Details', 'Verify OTP', 'Done'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i === 0 ? 'var(--primary-gradient)' : 'var(--divider)',
                  color: i === 0 ? 'white' : 'var(--text-light)',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: i === 0 ? 'var(--primary)' : 'var(--text-light)' }}>
                  {s}
                </span>
                {i < 2 && <div style={{ width: 20, height: 1, background: 'var(--divider)' }} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className={`form-input${errors.name ? ' error' : ''}`}
                type="text"
                placeholder="e.g. Manas Kundu"
                value={form.name}
                onChange={set('name')}
                onBlur={validate}
                autoComplete="name"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                className={`form-input${errors.phoneno ? ' error' : ''}`}
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phoneno}
                onChange={set('phoneno')}
                onBlur={validate}
                maxLength={10}
                autoComplete="tel"
              />
              {errors.phoneno && <span className="form-error">{errors.phoneno}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                className={`form-input${errors.email ? ' error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                onBlur={validate}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              id="register-btn"
              disabled={loading}
              style={{ padding: '14px 28px', fontSize: 14.5, marginTop: 4 }}
            >
              {loading ? <Spinner size="sm" white /> : 'Create Account →'}
            </button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '22px 0', color: 'var(--text-light)', fontSize: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
            <span>HAVE AN ACCOUNT?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
          </div>

          <Link
            to="/login"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '13px 28px',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
              color: 'var(--text-dark)', textDecoration: 'none',
              transition: 'border-color 180ms ease, color 180ms ease',
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
            Login Instead
          </Link>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-light)', marginTop: 20 }}>
            🔒 Your data is safe with us — we never share it
          </p>
        </div>
      </div>
    </div>
  )
}
