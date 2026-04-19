import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
import { ALL_CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from '../utils/format'

// ── Hero Slides ──
const SLIDES = [
  {
    bg: 'linear-gradient(160deg,#2d1515 0%,#4a1010 50%,#2d1515 100%)',
    title: 'Your Memories,\nPerfectly Printed',
    sub: 'Transform every cherished photo into a premium wall masterpiece.',
  },
  {
    bg: 'linear-gradient(160deg,#1a1a2e 0%,#3d0000 50%,#1a1a2e 100%)',
    title: 'Custom Frames\nfor Every Wall',
    sub: 'Portrait, Landscape, Circular, Floating — choose your perfect frame.',
  },
  {
    bg: 'linear-gradient(160deg,#0a0a0a 0%,#8B0000 50%,#0a0a0a 100%)',
    title: 'Premium Quality,\nDelivered to Your Door',
    sub: 'Glass, Metal, Wood, Acrylic — finest materials, flawless finish.',
  },
]

function HeroCarousel() {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()

  const next = useCallback(() => setActive((p) => (p + 1) % SLIDES.length), [])
  const prev = () => setActive((p) => (p - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [next])

  return (
    <section className="hero">
      {SLIDES.map((s, i) => (
        <div key={i} className={`hero-slide${active === i ? ' active' : ''}`}>
          <div className="hero-slide-bg" style={{ background: s.bg }} />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">{s.title.split('\n').map((t, j) => <span key={j}>{t}<br /></span>)}</h1>
            <p className="hero-subtitle">{s.sub}</p>
            <button className="hero-cta" onClick={() => navigate('/products')}>
              Shop Now →
            </button>
          </div>
        </div>
      ))}
      <button className="hero-nav-btn prev" onClick={prev} aria-label="Previous slide">◀</button>
      <button className="hero-nav-btn next" onClick={next} aria-label="Next slide">▶</button>
      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`hero-dot${active === i ? ' active' : ''}`} onClick={() => setActive(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  )
}

// ── Category Showcase ──
function CategoryShowcase() {
  return (
    <section className="section" style={{ background: 'var(--off-white)' }}>
      <div className="container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="section-title-accent" />
        <div className="category-grid">
          {ALL_CATEGORIES.map((cat) => (
            <Link key={cat} to={`/products?category=${cat}`} className="category-card">
              <span className="category-icon">{CATEGORY_ICONS[cat]}</span>
              <span className="category-name">{CATEGORY_LABELS[cat]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ──
const FAQS = [
  { q: 'What materials do you print on?', a: 'We print on premium Tiles, PVC, Glass, Metal, Wood, Acrylic, traditional Photo Frames, Posters, and Creative formats — all crafted to the highest standards.' },
  { q: 'Can I upload my own photo?', a: 'Absolutely! On every product page, you\'ll find a drag-and-drop upload zone. Simply upload your JPG or PNG (max 5MB) and see a live real-time preview of your photo inside the selected frame — before you order.' },
  { q: 'What sizes are available?', a: 'We offer 6 sizes: 8×12", 12×18", 17×24", 20×30", 24×36", and 36×48". All sizes are available in 3mm, 5mm, and 8mm thickness options.' },
  { q: 'How long does delivery take?', a: 'Standard delivery within India takes 5–7 working days after confirmation. Express delivery (3 working days) is available in select cities for an additional charge.' },
  { q: 'Can I cancel my order?', a: 'Orders cannot be cancelled once confirmed and payment is successfully processed. Please review your customisation carefully before placing the order.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, Net Banking, Credit Card, and Debit Card — all via secure Razorpay gateway. Note: We are prepaid only. Cash on Delivery is not available.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="section-title-accent" />
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <span className={`faq-chevron${open === i ? ' open' : ''}`}>▼</span>
              </div>
              <div className={`faq-answer${open === i ? ' open' : ''}`}>
                <p className="faq-answer-inner">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Why Choose Us ──
const FEATURES = [
  { icon: '🎨', title: 'Premium Materials', desc: 'Glass, metal, wood, acrylic — only the finest substrates for your prints.' },
  { icon: '📐', title: 'Custom Sizes', desc: 'Six size options from 8×12" to 36×48" with 3 thickness choices.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered pan-India in 5–7 working days. Free above ₹599.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'End-to-end encrypted. Razorpay — UPI, cards, net banking.' },
]

// ── Main HomePage ──
export default function HomePage() {
  const [products, setProducts]  = useState([])
  const [loading, setLoading]    = useState(true)
  const [showAll, setShowAll]    = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const displayed = showAll ? products.slice(0, 9) : products.slice(0, 6)

  return (
    <div className="page-enter">
      {/* Hero */}
      <HeroCarousel />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Best Sellers */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Best Sellers</h2>
          <div className="section-title-accent" />
          {loading ? (
            <Spinner center />
          ) : (
            <>
              <div className="product-grid">
                {displayed.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center' }}>
                {!showAll && products.length > 6 && (
                  <button className="btn btn-outline" onClick={() => setShowAll(true)}>
                    View More
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => navigate('/products')}>
                  See All Products →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2 className="cta-banner-title">Design Your Own Print</h2>
        <p className="cta-banner-sub">Upload your photo and see it come to life</p>
        <button className="cta-banner-btn" onClick={() => navigate('/products')}>
          Start Customising →
        </button>
      </section>

      {/* Why Choose Us */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <h2 className="section-title">Why Choose PrintCraft?</h2>
          <div className="section-title-accent" />
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
