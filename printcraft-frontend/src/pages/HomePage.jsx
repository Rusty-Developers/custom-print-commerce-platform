import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import CyclingFrame from '../components/CyclingFrame'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'
import { SAMPLE_PHOTOS, getCategoryFrameStyle } from '../utils/framePreview'

const CATEGORY_BACKGROUNDS = {
  TILES:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&fit=crop&auto=format&q=80',
  PVC:         'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&fit=crop&auto=format&q=80',
  GLASS:       'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&fit=crop&auto=format&q=80',
  METAL:       'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&fit=crop&auto=format&q=80',
  WOOD:        'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&fit=crop&auto=format&q=80',
  ACRYLIC:     'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=400&fit=crop&auto=format&q=80',
  PHOTO_FRAME: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=400&fit=crop&auto=format&q=80',
  POSTER:      'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=400&fit=crop&auto=format&q=80',
  CREATIVE:    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&fit=crop&auto=format&q=80',
}

// Per-frame 3D rotation — static, applied only as initial style (no JS transition needed)
const HERO_FRAMES = [
  { borderRadius: '8px',  floatClass: 'hp-float-1', transform: 'rotateY(-8deg) rotateX(4deg)' },
  { borderRadius: '50%',  floatClass: 'hp-float-2', transform: 'rotateY(8deg) rotateX(-4deg)' },
  { borderRadius: '36px', floatClass: 'hp-float-3', transform: 'rotateY(-6deg) rotateX(-3deg)' },
  { border: '8px solid #5a3e2b', borderRadius: '8px', floatClass: 'hp-float-4', transform: 'rotateY(6deg) rotateX(3deg)' },
]

const FAQS = [
  {
    q: 'What materials do you print on?',
    a: 'We print on premium Glass, Acrylic, Metal, Wood, PVC, Tiles and more. Each material gives a distinct premium look and finish.',
  },
  {
    q: 'Can I upload my own photo?',
    a: 'Yes! On any product page you can upload your photo and see it instantly previewed in the actual frame shape and size before ordering.',
  },
  {
    q: 'What sizes are available?',
    a: 'We offer 7 standard sizes: 8×12, 12×18, 17×24, 19×28, 20×30, 24×36, and 36×48 inches. Custom sizes available on request.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We deliver across India in 5-7 working days after production. You receive email + WhatsApp updates at every step.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders cannot be cancelled once confirmed and payment is received. Modification requests (size/frame changes) can be submitted within the modification window via WhatsApp or your account.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, Net Banking, Credit Card and Debit Card via Razorpay. We do not offer Cash on Delivery — all orders are prepaid.',
  },
]

const FEATURES = [
  {
    title: 'Premium Materials',
    desc: 'UV-resistant inks on Glass, Acrylic, Metal & more',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 9l10 13L22 9 12 2z" />
      </svg>
    ),
  },
  {
    title: 'Custom Sizes',
    desc: '7 sizes from 8×12 to 36×48 inches',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="8" width="20" height="8" rx="1" />
        <path d="M6 8v8M10 8v5M14 8v8M18 8v5" />
      </svg>
    ),
  },
  {
    title: 'Fast Delivery',
    desc: 'Delivered across India in 5-7 working days',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="6" width="15" height="10" rx="1" />
        <path d="M16 10h4l3 4v2h-7V10z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Secure Payments',
    desc: '100% prepaid via Razorpay — UPI, Cards, NetBanking',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

/* ─── Scroll Reveal Hook ─────────────────────────────────── */
function useScrollReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* ─── Skeleton Card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="skeleton" style={{ height: 220 }} />
      <div style={{ padding: 12, background: '#fff' }}>
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 12, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
      </div>
    </div>
  )
}

/* ─── Hero Trust Badge Icons ─────────────────────────────── */
function IconShield() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="6" width="15" height="10" rx="1" />
      <path d="M16 10h4l3 4v2h-7V10z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

/* ─── Hero Section ──────────────────────────────────────────── */
function HeroSection() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const framesContainerRef = useRef(null)

  const startIndices = useMemo(() => {
    const indices = []
    while (indices.length < 4) {
      const r = Math.floor(Math.random() * SAMPLE_PHOTOS.length)
      if (!indices.includes(r)) indices.push(r)
    }
    return indices
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Parallax only on pointer-accurate devices (mouse).
  // Skipping on touch/coarse devices prevents unintended transforms during scroll.
  const handleMouseMove = useCallback((e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = framesContainerRef.current
    if (!el) return
    const x = (e.clientX / window.innerWidth - 0.5) * 20
    const y = (e.clientY / window.innerHeight - 0.5) * 20
    el.style.transform = `rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = framesContainerRef.current
    if (!el) return
    el.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }, [])

  return (
    <section className="hp-hero" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="hp-hero-inner container">
        <div className="hp-hero-left">
          <p className="hp-hero-label">Premium Custom Prints</p>
          <h1 className={`hp-hero-title${mounted ? ' hp-hero-title--enter' : ''}`}>
            Your Memories
            <br />
            Beautifully Printed
          </h1>
          <p className="hp-hero-sub">
            Premium custom prints on Glass, Acrylic, Metal, Wood &amp; more. Delivered across India.
          </p>
          <div className="hp-hero-buttons">
            <button type="button" className="hp-btn-primary" onClick={() => navigate('/products')}>
              Shop Now →
            </button>
            <button type="button" className="hp-btn-outline" onClick={() => navigate('/products')}>
              See All Frames
            </button>
          </div>
          <div className="hp-hero-trust">
            <span className="hp-trust-item">
              <IconShield />
              Secure Payment
            </span>
            <span className="hp-trust-sep" aria-hidden="true">·</span>
            <span className="hp-trust-item">
              <IconTruck />
              Pan-India Delivery
            </span>
            <span className="hp-trust-sep" aria-hidden="true">·</span>
            <span className="hp-trust-item">
              <IconStar />
              4.8/5 Rating
            </span>
          </div>
        </div>

        <div className="hp-hero-right">
          {/* Perspective wrapper — JS applies container-level rotateX/Y for parallax.
              Individual frame divs have only their static initial transform (no JS transition)
              so there is no competing transition between container and children. */}
          <div
            ref={framesContainerRef}
            className="hp-hero-frames"
            style={{
              perspective: '1000px',
              transition: 'transform 0.12s ease-out',
              willChange: 'transform',
            }}
          >
            {HERO_FRAMES.map((frame, i) => (
              <div
                key={i}
                className={`hp-hero-frame ${frame.floatClass}`}
                style={{ transform: frame.transform }}
              >
                <CyclingFrame
                  photos={SAMPLE_PHOTOS}
                  width={140}
                  height={175}
                  frameStyle={{
                    borderRadius: frame.borderRadius,
                    border: frame.border,
                  }}
                  eager={i === 0}
                  pauseWhenHidden
                  initialIndex={startIndices[i]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Category Card ─────────────────────────────────────────── */
function CategoryCard({ category }) {
  const frameStyle = getCategoryFrameStyle(category)

  return (
    <Link
      to={`/products?category=${category}`}
      className="hp-category-card"
      aria-label={`Browse ${CATEGORY_LABELS[category]} prints`}
    >
      <div
        className="hp-category-preview"
        style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS[category]})` }}
      >
        <div className="hp-category-preview-overlay" />
        <CyclingFrame
          photos={SAMPLE_PHOTOS}
          width={110}
          height={140}
          frameStyle={{
            borderRadius: frameStyle.borderRadius,
            border: frameStyle.border,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
          className="hp-category-frame"
        />
      </div>
      <div className="hp-category-body">
        <h3 className="hp-category-name">{CATEGORY_LABELS[category]}</h3>
        <p className="hp-category-explore">Explore →</p>
      </div>
    </Link>
  )
}

function CategoryShowcase() {
  return (
    <section className="hp-section hp-section--white reveal">
      <div className="container">
        <h2 className="hp-section-title">Shop by Category</h2>
        <div className="hp-title-accent" />
        <p className="hp-section-sub">
          See how your photos look in every frame — tap to explore
        </p>
        <div className="hp-category-grid">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryCard key={cat} category={cat} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BestSellers() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="hp-section hp-section--gray reveal">
      <div className="container">
        <h2 className="hp-section-title">Best Sellers</h2>
        <div className="hp-title-accent" />
        {loading ? (
          <div className="pc-product-grid" style={{ marginTop: 0 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="pc-product-grid">
              {products.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="hp-view-all-wrap">
              <button type="button" className="hp-view-all-btn" onClick={() => navigate('/products')}>
                View All Products →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function WhyChooseUs() {
  return (
    <section className="hp-section hp-section--white reveal">
      <div className="container">
        <h2 className="hp-section-title hp-section-title--sm">Why Choose MK Group Printing</h2>
        <div className="hp-title-accent" />
        <div className="hp-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="hp-feature-card">
              <div className="hp-feature-icon-wrap" aria-hidden="true">{f.icon}</div>
              <h3 className="hp-feature-title">{f.title}</h3>
              <p className="hp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="hp-section hp-section--gray reveal">
      <div className="container">
        <h2 className="hp-section-title hp-section-title--sm">Frequently Asked Questions</h2>
        <div className="hp-title-accent" />
        <div className="hp-faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            const panelId = `faq-panel-${i}`
            const triggerId = `faq-trigger-${i}`
            return (
              <div key={item.q} className="hp-faq-item">
                <button
                  id={triggerId}
                  type="button"
                  className="hp-faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  {item.q}
                  <svg
                    className={`hp-faq-chevron${isOpen ? ' hp-faq-chevron--open' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  id={panelId}
                  className={`hp-faq-answer${isOpen ? ' hp-faq-answer--open' : ''}`}
                  role="region"
                  aria-labelledby={triggerId}
                >
                  <div className="hp-faq-answer-inner">{item.a}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  // Run scroll reveal after sections mount
  useScrollReveal([])

  return (
    <div className="page-enter">
      <HeroSection />
      <CategoryShowcase />
      <BestSellers />
      <WhyChooseUs />
      <FAQSection />
    </div>
  )
}
