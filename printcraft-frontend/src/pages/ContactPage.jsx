import { useState } from 'react'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

const CONTACT_INFO = [
  {
    icon: '📞',
    label: 'Phone',
    val: '+91 96472 12171',
    link: 'tel:+919647212171',
    sub: 'Call us anytime',
  },
  {
    icon: '✉️',
    label: 'Email',
    val: 'mkgroupprinting@gmail.com',
    link: 'mailto:mkgroupprinting@gmail.com',
    sub: 'We reply within 24 hrs',
  },
  {
    icon: '📍',
    label: 'Address',
    val: 'Manas Kundu, Girjapara (Kathgada), Dist. Paschim Burdwan, West Bengal – 713347',
    link: 'https://maps.google.com/?q=Girjapara+Kathgada+Paschim+Burdwan+West+Bengal+713347',
    sub: 'Visit our studio',
  },
  {
    icon: '📸',
    label: 'Instagram',
    val: '@mkgroupprinting',
    link: 'https://www.instagram.com/mkgroupprinting?igsh=ZmJhdmYxZjF1OWsz',
    sub: 'Follow our work',
  },
]

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
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
      {/* ── Cinematic Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 40%, #8B0000 100%)',
        padding: '80px 0 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(192,57,43,0.35) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(192,57,43,0.18)', border: '1px solid rgba(192,57,43,0.35)',
            borderRadius: 100, padding: '5px 16px', marginBottom: 20,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,200,200,0.9)', textTransform: 'uppercase' }}>
              ✦ Get in Touch
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px,5.5vw,54px)',
            fontWeight: 800, color: 'white', marginBottom: 12,
            letterSpacing: '-0.02em', lineHeight: 1.1,
            textShadow: '0 2px 24px rgba(0,0,0,0.4)',
          }}>
            Let's Create Something<br />
            <span style={{ color: '#FF9999' }}>Beautiful Together</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Drop us a message and we'll bring your vision to print.
          </p>
        </div>
      </div>

      <section className="section" style={{ background: 'var(--off-white)', paddingTop: 64, paddingBottom: 80 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
            gap: 48,
            alignItems: 'start',
          }}
          className="contact-layout"
          >
            {/* ── Contact Form ── */}
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: '40px 40px',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700,
                marginBottom: 6, color: 'var(--text-dark)',
              }}>
                Send a Message
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                Fill out the form and we'll get back to you within 24 hours.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={set('name')}
                    required
                    style={{ fontSize: 14 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="form-input form-textarea"
                    placeholder="Tell us about your print idea…"
                    value={form.message}
                    onChange={set('message')}
                    required
                    style={{ minHeight: 130 }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  id="contact-submit-btn"
                  disabled={loading}
                  style={{ marginTop: 4 }}
                >
                  {loading ? <Spinner size="sm" white /> : '📤 Send Message'}
                </button>
              </form>
            </div>

            {/* ── Contact Info Panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'linear-gradient(135deg, #1a0a0a, #3d0a0a)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 28px 24px',
                marginBottom: 4,
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700,
                  color: 'white', marginBottom: 6,
                }}>
                  Contact Information
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
                  Reach us through any of these channels — we're always happy to help.
                </p>

                {CONTACT_INFO.map((c) => (
                  <a
                    key={c.label}
                    href={c.link}
                    target={c.link.startsWith('http') ? '_blank' : undefined}
                    rel={c.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'flex', gap: 14, padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 10,
                      textDecoration: 'none',
                      transition: 'background 200ms ease, transform 200ms ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(192,57,43,0.22)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                        {c.label}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, wordBreak: 'break-word' }}>
                        {c.val}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                        {c.sub}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Map Link Card */}
              <a
                href="https://maps.google.com/?q=Girjapara+Kathgada+Paschim+Burdwan+West+Bengal+713347"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--divider)',
                  height: 130,
                  background: 'linear-gradient(135deg, #f9f9f9, #fff)',
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  transition: 'box-shadow 200ms ease, transform 200ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: 36 }}>🗺️</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>View on Google Maps</span>
                <span style={{ fontSize: 11 }}>Girjapara, Paschim Burdwan, WB</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
