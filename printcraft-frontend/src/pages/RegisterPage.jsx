import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', phoneno: '', email: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t) }, [])

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

      <div className={`auth-panel-cinema${mounted ? ' auth-panel--visible' : ''}`} style={{ maxWidth: 480 }}>
        <div className="auth-deco-strip" />

        <div className="auth-panel-body">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo-wrap">
              <Logo size={22} />
            </div>
            <h1 className="auth-heading">Create Account</h1>
            <p className="auth-subheading">
              Join MK Group Printing — your prints await
            </p>
          </div>

          {/* Steps indicator */}
          <div className="auth-steps">
            {['Details', 'Verify OTP', 'Done'].map((s, i) => (
              <div key={s} className="auth-step">
                <div className={`auth-step-dot${i === 0 ? ' active' : ''}`}>{i + 1}</div>
                <span className={`auth-step-label${i === 0 ? ' active' : ''}`}>{s}</span>
                {i < 2 && <div className="auth-step-connector" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
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
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input
                  id="reg-phone"
                  className={`form-input phone-input${errors.phoneno ? ' error' : ''}`}
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phoneno}
                  onChange={set('phoneno')}
                  onBlur={validate}
                  maxLength={10}
                  autoComplete="tel"
                  inputMode="numeric"
                />
              </div>
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
              className="btn btn-primary btn-full auth-submit-btn"
              id="register-btn"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" white /> : 'Create Account →'}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">HAVE AN ACCOUNT?</span>
            <div className="auth-divider-line" />
          </div>

          <Link to="/login" className="auth-alt-btn">
            Login Instead
          </Link>

          <p className="auth-footnote">
            🔒 Your data is safe with us — we never share it
          </p>
        </div>
      </div>
    </div>
  )
}
