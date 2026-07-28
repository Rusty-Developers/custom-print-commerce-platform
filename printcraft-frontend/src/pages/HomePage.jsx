import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'
import mkgLogo from '../assets/logopiv/mkg.jpeg'
import useSeo from '../hooks/useSeo'
import catTiles      from '../assets/CATEGORY_BACKGROUNDS/TILES.jpeg'
import catPvc        from '../assets/CATEGORY_BACKGROUNDS/Pvc door.jpeg'
import catGlass      from '../assets/CATEGORY_BACKGROUNDS/Glass printing.jpeg'
import catMetal      from '../assets/CATEGORY_BACKGROUNDS/Metal printing.jpeg'
import catAcrylic    from '../assets/CATEGORY_BACKGROUNDS/Archylic.jpeg'
import catPhotoFrame from '../assets/CATEGORY_BACKGROUNDS/Photo frame.jpeg'
import catPoster     from '../assets/CATEGORY_BACKGROUNDS/Poster printing.jpeg'

/* ─── Carousel Slides ─────────────────────────────────────── */
const CAROUSEL_SLIDES = [
  {
    img: new URL('../assets/carosalPICS/GLASS.jpeg', import.meta.url).href,
    label: 'PREMIUM GLASS PRINTS',
    caption: 'UV-Resistant Inks on Crystal-Clear Glass',
    category: 'GLASS',
    btnLabel: 'Shop Glass Prints',
  },
  {
    img: new URL('../assets/carosalPICS/Archylic.jpeg', import.meta.url).href,
    label: 'ACRYLIC WALL ART',
    caption: 'Vivid Colours Behind Premium Acrylic',
    category: 'ACRYLIC',
    btnLabel: 'Shop Acrylic Prints',
  },
  {
    img: new URL('../assets/carosalPICS/Photo frame.jpeg', import.meta.url).href,
    label: 'LUXURY CUSTOM FRAMES',
    caption: 'Every Detail Crafted to Perfection',
    category: 'PHOTO_FRAME',
    btnLabel: 'Shop Photo Frames',
  },
  {
    img: new URL('../assets/carosalPICS/WOODEN.jpeg', import.meta.url).href,
    label: 'NATURAL WOOD PRINTS',
    caption: 'Warm, Textured Prints on Real Wood',
    category: 'WOOD',
    btnLabel: 'Shop Wooden Prints',
  },
  {
    img: new URL('../assets/carosalPICS/Metal printing.jpeg', import.meta.url).href,
    label: 'METAL WALL PRINTS',
    caption: 'Sleek, Durable Prints on Premium Metal',
    category: 'METAL',
    btnLabel: 'Shop Metal Prints',
  },
  {
    img: new URL('../assets/carosalPICS/Poster printing.jpeg', import.meta.url).href,
    label: 'BOLD POSTER PRINTING',
    caption: 'High-Resolution Prints in 7 Sizes',
    category: 'POSTER',
    btnLabel: 'Shop Posters',
  },
]

// Pills → navigate directly to category listing
const MATERIAL_PILLS = [
  { key: 'ACRYLIC', label: 'Acrylic' },
  { key: 'GLASS',   label: 'Glass'   },
  { key: 'WOOD',    label: 'Wood'    },
  { key: 'METAL',   label: 'Metal'   },
]




/* ─── Category Backgrounds ────────────────────────────────── */
const CATEGORY_BACKGROUNDS = {
  TILES:       catTiles,
  PVC:         catPvc,
  GLASS:       catGlass,
  METAL:       catMetal,
  WOOD:        'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&fit=crop&auto=format&q=80',
  ACRYLIC:     catAcrylic,
  PHOTO_FRAME: catPhotoFrame,
  POSTER:      catPoster,
  CREATIVE:    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&fit=crop&auto=format&q=80',
}

const FAQS = [
  { q: 'What materials do you print on?',   a: 'We print on premium Glass, Acrylic, Metal, Wood, PVC, Tiles and more. Each material gives a distinct premium look and finish.' },
  { q: 'Can I upload my own photo?',         a: 'Yes! On any product page you can upload your photo and see it instantly previewed in the actual frame shape and size before ordering.' },
  { q: 'What sizes are available?',          a: 'We offer 7 standard sizes: 8×12, 12×18, 17×24, 19×28, 20×30, 24×36, and 36×48 inches. Custom sizes available on request.' },
  { q: 'How long does delivery take?',       a: 'We deliver across India in 5-7 working days after production. You receive email + WhatsApp updates at every step.' },
  { q: 'Can I cancel my order?',             a: 'Orders cannot be cancelled once confirmed and payment is received. Modification requests can be submitted within the window via WhatsApp or your account.' },
  { q: 'What payment methods do you accept?',a: 'We accept UPI, Net Banking, Credit Card and Debit Card via Razorpay. We do not offer Cash on Delivery — all orders are prepaid.' },
]

const FEATURES = [
  {
    title: 'Premium Materials',
    desc:  'UV-resistant inks on Glass, Acrylic, Metal & more',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 9l10 13L22 9 12 2z"/></svg>,
  },
  {
    title: 'Custom Sizes',
    desc:  '7 sizes from 8×12 to 36×48 inches',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v8M10 8v5M14 8v8M18 8v5"/></svg>,
  },
  {
    title: 'Fast Delivery',
    desc:  'Delivered across India in 5-7 working days',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="6" width="15" height="10" rx="1"/><path d="M16 10h4l3 4v2h-7V10z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    title: 'Secure Payments',
    desc:  '100% prepaid via Razorpay — UPI, Cards, NetBanking',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>,
  },
]

/* ─── Scroll Reveal Hook ──────────────────────────────────── */
function useScrollReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* ─── Hero Trust Icons ───────────────────────────────────── */
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/>
  </svg>
)
const IconTruck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="6" width="15" height="10" rx="1"/><path d="M16 10h4l3 4v2h-7V10z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

/* ─── Prewarm a single image URL into the browser cache ──────── */
function prewarm(src) {
  if (!src) return
  const img = new Image()
  img.src = src
  if (img.decode) img.decode().catch(() => {})
}

/* ─── Hero Section ────────────────────────────────────────── */
function HeroSection() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const total = CAROUSEL_SLIDES.length

  // ── Dual-layer crossfade state ──
  // layerA and layerB hold {src, opacity}. We ping-pong between them.
  const [layerA, setLayerA] = useState({ src: CAROUSEL_SLIDES[0].img, opacity: 1 })
  const [layerB, setLayerB] = useState({ src: '', opacity: 0 })
  const topLayer   = useRef('A')        // which layer is "on top" / visible
  const currIdx    = useRef(0)
  const intervalRef = useRef(null)

  // ── Caption/label follow the "current" top layer slide ──
  const [slideIdx, setSlideIdx] = useState(0)

  // ── Preload all images on mount ──
  useEffect(() => {
    CAROUSEL_SLIDES.forEach(s => prewarm(s.img))
    setMounted(true)
  }, [])

  // ── Perform one crossfade tick ──
  const tick = useCallback(() => {
    const next    = (currIdx.current + 1) % total
    const nextSrc = CAROUSEL_SLIDES[next].img

    // Preload the slide after next so it's always warm
    prewarm(CAROUSEL_SLIDES[(next + 1) % total].img)

    currIdx.current = next

    const doSwap = () => {
      if (topLayer.current === 'A') {
        // A is visible → load next into B, fade B in, fade A out
        setLayerB({ src: nextSrc, opacity: 1 })
        setLayerA(prev => ({ ...prev, opacity: 0 }))
        topLayer.current = 'B'
        // After fade, free A's memory
        setTimeout(() => setLayerA({ src: '', opacity: 0 }), 700)
      } else {
        // B is visible → load next into A, fade A in, fade B out
        setLayerA({ src: nextSrc, opacity: 1 })
        setLayerB(prev => ({ ...prev, opacity: 0 }))
        topLayer.current = 'A'
        setTimeout(() => setLayerB({ src: '', opacity: 0 }), 700)
      }
      setSlideIdx(next)
    }

    // Gate the swap on the image being decoded (or 200ms safety timeout)
    const img = new Image()
    img.src = nextSrc
    const timeout = setTimeout(doSwap, 200)
    if (img.complete) {
      clearTimeout(timeout)
      doSwap()
    } else {
      img.onload  = () => { clearTimeout(timeout); doSwap() }
      img.onerror = () => { clearTimeout(timeout); doSwap() }
    }
  }, [total])

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 4000)
  }, [tick])

  useEffect(() => {
    startInterval()
    return () => clearInterval(intervalRef.current)
  }, [startInterval])

  const goTo = useCallback((idx) => {
    if (idx === currIdx.current) return
    // Jump directly: load target into the hidden layer then crossfade
    const targetSrc = CAROUSEL_SLIDES[idx].img
    currIdx.current = idx

    const doSwap = () => {
      if (topLayer.current === 'A') {
        setLayerB({ src: targetSrc, opacity: 1 })
        setLayerA(prev => ({ ...prev, opacity: 0 }))
        topLayer.current = 'B'
        setTimeout(() => setLayerA({ src: '', opacity: 0 }), 700)
      } else {
        setLayerA({ src: targetSrc, opacity: 1 })
        setLayerB(prev => ({ ...prev, opacity: 0 }))
        topLayer.current = 'A'
        setTimeout(() => setLayerB({ src: '', opacity: 0 }), 700)
      }
      setSlideIdx(idx)
    }

    const img = new Image()
    img.src = targetSrc
    const timeout = setTimeout(doSwap, 200)
    if (img.complete) { clearTimeout(timeout); doSwap() }
    else {
      img.onload  = () => { clearTimeout(timeout); doSwap() }
      img.onerror = () => { clearTimeout(timeout); doSwap() }
    }
    startInterval()
  }, [startInterval])

  const prev = useCallback(() => goTo((currIdx.current - 1 + total) % total), [total, goTo])
  const next = useCallback(() => goTo((currIdx.current + 1) % total), [total, goTo])

  const current = CAROUSEL_SLIDES[slideIdx]
  const FADE_MS = 700
  const FADE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

  const imgStyle = (opacity, zIdx) => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    display: 'block',
    willChange: 'opacity',
    zIndex: zIdx,
    opacity,
    transition: opacity === 0
      ? 'none'
      : `opacity ${FADE_MS}ms ${FADE_EASE}`,
  })

  return (
    <>
    <section className="hp-hero">
      {/* ══ LEFT — Light copy panel ══ */}
      <div className={`hp-hero-left${mounted ? ' hp-hero-left--enter' : ''}`}>
        <p className="hp-hero-label">Premium Custom Prints</p>
        <h1 className="hp-hero-title">
          Your Memories<br />
          Beautifully Printed
        </h1>
        <p className="hp-hero-sub">
          Premium custom prints on Glass, Acrylic, Metal, Wood &amp; more. Delivered across India.
        </p>

        {/* Category pills — each one deep-links to that category's products */}
        <div className="hp-material-toggle" role="group" aria-label="Browse by material">
          {MATERIAL_PILLS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className="hp-material-pill"
              onClick={() => navigate(`/products?category=${key}`)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hp-hero-buttons">
          <button
            type="button"
            id="hero-view-all-products-btn"
            className="hp-btn-primary"
            onClick={() => navigate('/products')}
          >
            View All Products →
          </button>
          <button type="button" className="hp-btn-outline" onClick={() => navigate('/about')}>
            Why Us? →
          </button>
        </div>

        <div className="hp-hero-trust">
          <span className="hp-trust-item"><IconShield /> Secure Payment</span>
          <span className="hp-trust-sep" aria-hidden="true">·</span>
          <span className="hp-trust-item"><IconTruck /> Pan-India Delivery</span>
          <span className="hp-trust-sep" aria-hidden="true">·</span>
          <span className="hp-trust-item"><IconStar /> 4.8/5 Rating</span>
        </div>
      </div>

      {/* ══ RIGHT — Crimson carousel panel ══ */}
      <div className="hp-hero-right">
        {/* MK Group brand watermark */}
        <img src={mkgLogo} alt="" className="hp-carousel-logo-bg" aria-hidden="true" />
        {/* Deep red overlay + texture */}
        <div className="hp-carousel-overlay" />
        {/* Decorative large MK letterform */}
        <div className="hp-carousel-letter" aria-hidden="true">MK</div>

        {/* ── Dual-layer zero-blank crossfade ── */}
        <div className="hp-carousel-img-wrap">
          {layerA.src && (
            <img
              src={layerA.src}
              alt=""
              aria-hidden="true"
              decoding="async"
              style={imgStyle(layerA.opacity, topLayer.current === 'A' ? 2 : 1)}
            />
          )}
          {layerB.src && (
            <img
              src={layerB.src}
              alt=""
              aria-hidden="true"
              decoding="async"
              style={imgStyle(layerB.opacity, topLayer.current === 'B' ? 2 : 1)}
            />
          )}
          {/* Image scrim on top of images */}
          <div className="hp-carousel-img-scrim" style={{ zIndex: 3 }} />
        </div>

        {/* Brand label centred over image */}
        <div className="hp-carousel-brand">
          <span className="hp-carousel-brand-title">MK GROUP</span>
          <span className="hp-carousel-brand-sub">{current.label}</span>
        </div>

        {/* Arrow controls */}
        <button className="hp-carousel-arrow hp-carousel-arrow--prev" onClick={prev} aria-label="Previous slide">
          &#8249;
        </button>
        <button className="hp-carousel-arrow hp-carousel-arrow--next" onClick={next} aria-label="Next slide">
          &#8250;
        </button>

        {/* Dot navigation */}
        <div className="hp-carousel-dots" role="tablist" aria-label="Carousel navigation">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === slideIdx}
              aria-label={`Slide ${i + 1}`}
              className={`hp-carousel-dot${i === slideIdx ? ' active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Per-slide Shop Now CTA — deep-links to the slide's category */}
        <div className="hp-carousel-cta-bar">
          <span className="hp-carousel-cta-caption">{current.caption}</span>
          <button
            type="button"
            className="hp-carousel-shop-btn"
            id="carousel-shop-now-btn"
            onClick={() =>
              navigate(
                current.category
                  ? `/products?category=${current.category}`
                  : '/products'
              )
            }
            aria-label={current.btnLabel}
          >
            {current.btnLabel} →
          </button>
        </div>
      </div>
    </section>

    {/* ── Advertisement Banner — store showcase image below hero ── */}
    <div
      className="hp-ad-banner"
      role="complementary"
      aria-label="MK GROUP store showcase"
    >
      <img
        src={new URL('../assets/carosalMusthavethisPIC/WhatsApp Image 2026-07-11 at 15.09.25.jpeg', import.meta.url).href}
        alt="MK GROUP Printing — Visit our store"
        className="hp-ad-banner-img"
        loading="lazy"
        decoding="async"
      />
      <div className="hp-ad-banner-overlay">
        <span className="hp-ad-banner-tag">Our Store</span>
        <span className="hp-ad-banner-text">Welcome to MK GROUP Printing — Premium Custom Frames & Prints</span>
        <button
          type="button"
          className="hp-ad-banner-btn"
          onClick={() => navigate('/products')}
        >
          Shop Now →
        </button>
      </div>
    </div>
    </>
  )
}


/* ─── Skeleton Card ───────────────────────────────────────── */
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

/* ─── Category Card ───────────────────────────────────────── */
function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${category}`}
      className="hp-category-card"
      aria-label={`Browse ${CATEGORY_LABELS[category]} prints`}
    >
      {/* Full-bleed background — aspect-ratio:3/2 matches source photos,
          so cover shows the full image with zero cropping on any side */}
      <div
        className="hp-category-preview"
        style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS[category]})` }}
      />
      {/* Gradient scrim */}
      <div className="hp-category-preview-overlay" />
      {/* Overlay text at bottom */}
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
        <p className="hp-section-sub">See how your photos look in every frame — tap to explore</p>
        <div className="hp-category-grid">
          {ALL_CATEGORIES.map((cat) => <CategoryCard key={cat} category={cat} />)}
        </div>
      </div>
    </section>
  )
}

function BestSellers() {
  const navigate  = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const gridRef = useRef(null)

  useEffect(() => {
    api.get('/api/products').then((r) => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Staggered scroll-reveal for product cards
  useEffect(() => {
    if (loading || !gridRef.current) return
    const items = gridRef.current.querySelectorAll('.reveal-item')
    if (!items.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [loading])

  return (
    <section className="hp-section hp-section--gray reveal">
      <div className="container">
        <h2 className="hp-section-title">Best Sellers</h2>
        <div className="hp-title-accent" />
        {loading ? (
          <div className="pc-product-grid" style={{ marginTop: 0 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="pc-product-grid" ref={gridRef}>
              {products.slice(0, 6).map((p, i) => (
                <div
                  key={p.id}
                  className="reveal-item"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <ProductCard product={p} />
                </div>
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
        <h2 className="hp-section-title hp-section-title--sm">Why Choose MK GROUP Printing</h2>
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
            const isOpen    = openIndex === i
            const panelId   = `faq-panel-${i}`
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
                  <svg className={`hp-faq-chevron${isOpen ? ' hp-faq-chevron--open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6"/>
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
  useSeo(
    'MK GROUP Printing — Premium Custom Prints',
    'Transform your memories into premium custom prints on Glass, Acrylic, Metal, Wood & more. Delivered pan-India in 5-7 days.'
  )
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
