import { useNavigate } from 'react-router-dom'
import newLogo from '../assets/logopiv/newlogo1.jpeg'
import useSeo from '../hooks/useSeo'
import '../about.css'

const VALUES = [
  {
    icon: '🏆',
    title: 'Quality',
    desc: 'We use only premium substrates — UV-resistant glass, aircraft-grade metal, sustainably sourced wood — to ensure every print is a lasting treasure.',
  },
  {
    icon: '🎨',
    title: 'Craftsmanship',
    desc: 'Every order is personally inspected by our master printers. No automated conveyor belts — each print is crafted with care and intention.',
  },
  {
    icon: '❤️',
    title: 'Customer First',
    desc: "Your satisfaction is our mission, not just our motto. From upload to doorstep, we're with you every step of the way.",
  },
]

const TIMELINE = [
  { year: '2020', title: 'MK GROUP Printing Founded', desc: 'Started as a one-room print studio in Girjapara, Paschim Burdwan, West Bengal with two premium printers and a dream to make custom prints accessible.' },
  { year: '2021', title: 'Went Online', desc: 'Launched our first e-commerce platform. Within 6 months, served customers across 18 Indian states.' },
  { year: '2023', title: 'Expanded Materials', desc: 'Added Glass, Metal, and Acrylic printing to our range. Installed state-of-the-art UV printing equipment.' },
  { year: '2025', title: 'Premium Platform Launch', desc: 'Launched our new platform with live photo preview, instant pricing, and pan-India delivery across 500+ cities.' },
]

const STATS = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '500+', label: 'Cities Served' },
  { value: '6+', label: 'Print Materials' },
]

export default function AboutPage() {
  useSeo(
    'About Us — MK GROUP Printing',
    'Learn the story of MK GROUP Printing — a premium custom print studio serving thousands of customers across India with passion and craftsmanship.'
  )
  const navigate = useNavigate()

  return (
    <div className="page-enter">

      {/* ── Hero Banner ── */}
      <div className="about-hero">
        <div className="about-hero-pattern" aria-hidden="true" />
        <div className="about-hero-content">
          <h1 className="about-hero-title">Our Story</h1>
          <p className="about-hero-sub">Premium prints crafted with passion</p>
        </div>
      </div>

      {/* ── Intro Section ── */}
      <section className="section about-intro-section">
        <div className="container">
          <div className="about-intro-grid">

            {/* Text column */}
            <div className="about-intro-text">
              <h2 className="about-intro-heading">
                Where Memories Become&nbsp;Masterpieces
              </h2>
              <p className="about-intro-para">
                MK GROUP Printing was born from a simple belief — that every memory deserves to be
                displayed beautifully. We started in a small studio in Girjapara, West Bengal,
                armed with nothing but premium printers and an obsession with quality.
              </p>
              <p className="about-intro-para">
                Today, we serve thousands of customers across India, transforming cherished
                photographs into stunning prints on glass, metal, wood, acrylic, and more. Every
                piece that leaves our studio is a testament to our commitment to craftsmanship.
              </p>
              <button
                className="btn btn-primary about-cta-btn"
                onClick={() => navigate('/products')}
              >
                Shop Our Collection →
              </button>
            </div>

            {/* Brand card column */}
            <div className="about-brand-card">
              <div className="about-brand-logo-wrap">
                <img
                  src={newLogo}
                  alt="MK GROUP Printing"
                  className="about-brand-logo"
                />
              </div>
              <div className="about-brand-name">MK GROUP Printing</div>
              <div className="about-brand-tagline">Premium Custom Print Studio</div>
              <ul className="about-brand-facts">
                <li>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', opacity: 0.6, textTransform: 'uppercase' }}>Printing Lab 1</span><br />
                  📍 RANIGANJ, GIRJAPARA, KATHGADA, PASCHIM BARDHAMAN, WB – 713347, INDIA
                </li>
                <li>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', opacity: 0.6, textTransform: 'uppercase' }}>Printing Lab 2</span><br />
                  📍 Namburu, Guntur District, Andhra Pradesh – 522508
                </li>
                <li>🏭 Premium Print Studio</li>
                <li>🚚 Pan-India Delivery</li>
                <li>⭐ 4.8 / 5 — 10,000+ Orders</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="about-stats-bar">
        <div className="container">
          <div className="about-stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="about-stat-item">
                <span className="about-stat-value">{s.value}</span>
                <span className="about-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <section className="section about-values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="section-title-accent" />
          <div className="about-values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-icon">{v.icon}</span>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="section about-timeline-section">
        <div className="container about-timeline-container">
          <h2 className="section-title">Our Journey</h2>
          <div className="section-title-accent" />
          <div className="about-timeline">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="about-tl-item">
                <div className="about-tl-left">
                  <span className="about-tl-year">{t.year}</span>
                </div>
                <div className="about-tl-connector">
                  <div className="about-tl-dot" />
                  {i < TIMELINE.length - 1 && <div className="about-tl-line" />}
                </div>
                <div className="about-tl-right">
                  <h3 className="about-tl-title">{t.title}</h3>
                  <p className="about-tl-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
