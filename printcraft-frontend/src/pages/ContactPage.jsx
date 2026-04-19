import { useState } from 'react'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

export default function ContactPage() {
  const [form, setForm]   = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all fields'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Message sent! We'll get back to you soon. 📬")
    setForm({ name: '', email: '', message: '' })
    setLoading(false)
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ background: 'var(--primary-gradient)', padding: '60px 0 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 44, fontWeight: 800, color: 'white', marginBottom: 10 }}>Get in Touch</h1>
        <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 17 }}>We'd love to hear from you — drop us a message!</p>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
            {/* Form */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Send a Message</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Your Name</label>
                  <input id="contact-name" className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email Address</label>
                  <input id="contact-email" className="form-input" type="email" placeholder="rahul@example.com" value={form.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" className="form-input form-textarea" placeholder="How can we help you?" value={form.message} onChange={set('message')} required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" id="contact-submit-btn" disabled={loading}>
                  {loading ? <Spinner size="sm" white /> : '📤 Send Message'}
                </button>
              </form>
            </div>

            {/* Info */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Contact Info</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { icon: '📞', label: 'Phone', val: '+91 98765 43210' },
                  { icon: '✉️', label: 'Email', val: 'hello@printcraft.in' },
                  { icon: '📍', label: 'Address', val: '42, Craft Lane, Koramangala, Bengaluru, Karnataka 560034' },
                  { icon: '⏰', label: 'Working Hours', val: 'Monday–Saturday: 9AM – 7PM IST' },
                ].map((c) => (
                  <div key={c.label} style={{ display: 'flex', gap: 14, padding: 16, background: 'var(--off-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--divider)' }}>
                    <span style={{ fontSize: 24 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-dark)', marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{c.val}</div>
                    </div>
                  </div>
                ))}

                {/* Map placeholder */}
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--divider)', height: 200, background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: 40 }}>🗺️</span>
                  <span style={{ fontSize: 14 }}>Map — Bengaluru, Karnataka</span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>42, Craft Lane, Koramangala</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
