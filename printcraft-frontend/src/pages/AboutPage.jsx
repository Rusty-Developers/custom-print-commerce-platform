import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function AboutPage() {
  const navigate = useNavigate()
  const VALUES = [
    { icon: '🏆', title: 'Quality', desc: 'We use only premium substrates — UV-resistant glass, aircraft-grade metal, sustainably sourced wood — to ensure every print is a lasting treasure.' },
    { icon: '🎨', title: 'Craftsmanship', desc: 'Every order is personally inspected by our master printers. No automated conveyor belts — each print is crafted with care and intention.' },
    { icon: '❤️', title: 'Customer First', desc: 'Your satisfaction is our mission, not just our motto. From upload to doorstep, we\'re with you every step of the way.' },
  ]
  const TIMELINE = [
    { year: '2020', title: 'MK Group Printing Founded', desc: 'Started as a one-room print studio in Bengaluru with two premium printers and a dream to make custom prints accessible.' },
    { year: '2021', title: 'Went Online', desc: 'Launched our first e-commerce platform. Within 6 months, served customers across 18 Indian states.' },
    { year: '2023', title: 'Expanded Materials', desc: 'Added Glass, Metal, and Acrylic printing to our range. Installed state-of-the-art UV printing equipment.' },
    { year: '2025', title: 'Premium Platform Launch', desc: 'Launched our new platform with live photo preview, instant pricing, and pan-India delivery across 500+ cities.' },
  ]
  return (
    <div className="page-enter">
      {/* Hero Banner */}
      <div style={{ background: 'var(--primary-gradient)', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 52, fontWeight: 800, color: 'white', marginBottom: 14, position: 'relative' }}>Our Story</h1>
        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.88)', position: 'relative' }}>Premium prints crafted with passion</p>
      </div>

      {/* Intro */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
                Where Memories Become Masterpieces
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: 16 }}>
                MK Group Printing was born from a simple belief — that every memory deserves to be displayed beautifully. We started in a small studio in Bengaluru's Koramangala, armed with nothing but premium printers and an obsession with quality.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: 24 }}>
                Today, we serve thousands of customers across India, transforming cherished photographs into stunning prints on glass, metal, wood, acrylic, and more. Every piece that leaves our studio is a testament to our commitment to craftsmanship.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Our Collection →</button>
            </div>
            <div style={{ background: 'var(--primary-gradient)', borderRadius: 'var(--radius-xl)', padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <Logo size={36} color="#fff" />
              <div style={{ color: 'rgba(255,255,255,0.9)', marginTop: 24, fontSize: 15, lineHeight: 1.8 }}>
                <div>📍 Bengaluru, India</div>
                <div>🏭 Premium Print Studio</div>
                <div>🚚 Pan-India Delivery</div>
                <div>⭐ 4.8/5 — 10,000+ Orders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="section-title-accent" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {VALUES.map((v) => (
              <div key={v.title} className="feature-card">
                <span className="feature-icon">{v.icon}</span>
                <h3 className="feature-title">{v.title}</h3>
                <p className="feature-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 className="section-title">Our Journey</h2>
          <div className="section-title-accent" />
          <div className="timeline">
            {TIMELINE.map((t) => (
              <div key={t.year} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-year">{t.year}</div>
                <h3 className="timeline-title">{t.title}</h3>
                <p className="timeline-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
