import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import CyclingFrame from '../components/CyclingFrame'
import Spinner from '../components/Spinner'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'
import { HERO_PHOTOS, SAMPLE_PHOTOS, getCategoryFrameStyle } from '../utils/framePreview'

const CATEGORY_BACKGROUNDS = {
  TILES: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&fit=crop',
  PVC: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&fit=crop',
  GLASS: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&fit=crop',
  METAL: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&fit=crop',
  WOOD: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&fit=crop',
  ACRYLIC: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=400&fit=crop',
  PHOTO_FRAME: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=400&fit=crop',
  POSTER: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=400&fit=crop',
  CREATIVE: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&fit=crop',
}

const HERO_FRAMES = [
  { borderRadius: '8px', floatClass: 'hp-float-1' },
  { borderRadius: '50%', floatClass: 'hp-float-2' },
  { borderRadius: '36px', floatClass: 'hp-float-3' },
  { border: '8px solid #5a3e2b', borderRadius: '8px', floatClass: 'hp-float-4' },
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
    a: 'We offer 6 standard sizes: 8×12, 12×18, 17×24, 20×30, 24×36, and 36×48 inches. Custom sizes available on request.',
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
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 9l10 13L22 9 12 2z" />
      </svg>
    ),
  },
  {
    title: 'Custom Sizes',
    desc: '6 sizes from 8×12 to 36×48 inches',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="8" width="20" height="8" rx="1" />
        <path d="M6 8v8M10 8v5M14 8v8M18 8v5" />
      </svg>
    ),
  },
  {
    title: 'Fast Delivery',
    desc: 'Delivered across India in 5-7 working days',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

function HeroSection() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="hp-hero">
      <div className="hp-hero-inner container">
        <div className="hp-hero-left">
          <p className="hp-hero-label">PREMIUM CUSTOM PRINTS</p>
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
            <span>🔒 Secure Payment</span>
            <span className="hp-trust-sep">•</span>
            <span>🚚 Pan-India Delivery</span>
            <span className="hp-trust-sep">•</span>
            <span>⭐ 4.8/5 Rating</span>
          </div>
        </div>

        <div className="hp-hero-right">
          <div className="hp-hero-frames">
            {HERO_FRAMES.map((frame, i) => (
              <CyclingFrame
                key={i}
                photos={HERO_PHOTOS}
                width={140}
                height={175}
                frameStyle={{
                  borderRadius: frame.borderRadius,
                  border: frame.border,
                }}
                className={`hp-hero-frame ${frame.floatClass}`}
                eager={i === 0}
                pauseWhenHidden
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ category }) {
  const navigate = useNavigate()
  const frameStyle = getCategoryFrameStyle(category)

  return (
    <div
      className="hp-category-card"
      onClick={() => navigate(`/products?category=${category}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/products?category=${category}`)}
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
    </div>
  )
}

function CategoryShowcase() {
  return (
    <section className="hp-section hp-section--white">
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
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="hp-section hp-section--gray">
      <div className="container">
        <h2 className="hp-section-title">Best Sellers</h2>
        <div className="hp-title-accent" />
        {loading ? (
          <Spinner center />
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
    <section className="hp-section hp-section--white">
      <div className="container">
        <h2 className="hp-section-title hp-section-title--sm">Why Choose MK Group Printing</h2>
        <div className="hp-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="hp-feature-card">
              <div className="hp-feature-icon-wrap">{f.icon}</div>
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
    <section className="hp-section hp-section--gray">
      <div className="container">
        <h2 className="hp-section-title hp-section-title--sm">Frequently Asked Questions</h2>
        <div className="hp-faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={item.q} className="hp-faq-item">
                <button
                  type="button"
                  className="hp-faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
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
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className={`hp-faq-answer${isOpen ? ' hp-faq-answer--open' : ''}`}>
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
