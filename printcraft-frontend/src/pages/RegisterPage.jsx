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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <Logo size={24} />
          <h1 className="auth-title" style={{ marginTop: 20 }}>Create Account</h1>
          <p className="auth-subtitle">Join PrintCraft — your prints await</p>
        </div>
        <div className="auth-card-body">
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className={`form-input${errors.name ? ' error' : ''}`}
                type="text"
                placeholder="e.g. Priya Sharma"
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
                placeholder="hello@example.com"
                value={form.email}
                onChange={set('email')}
                onBlur={validate}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" id="register-btn" disabled={loading}>
              {loading ? <Spinner size="sm" white /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login">Login →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
