import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import CyclingFrame from '../components/CyclingFrame'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'
import { SAMPLE_PHOTOS, getCategoryFrameStyle } from '../utils/framePreview'
import { PHOTO_POOL, getFrameStartIndexes } from '../utils/photoPool'




/* ─── Category Backgrounds ────────────────────────────────── */
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

/* ─── Material Toggle Photo Pools ─────────────────────────── */
const MATERIAL_PHOTOS = {
  all:     null, // null = default PHOTO_POOL
  acrylic: [
    'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=300&fit=crop&q=80',
  ],
  glass: [
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&fit=crop&q=80',
  ],
  wood: [
    'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581781870027-0f1c48c1bada?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&fit=crop&q=80',
  ],
  metal: [
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=300&fit=crop&q=80',
  ],
}

const MATERIAL_PILLS = [
  { key: 'acrylic', label: 'Acrylic' },
  { key: 'glass',   label: 'Glass'   },
  { key: 'wood',    label: 'Wood'    },
  { key: 'metal',   label: 'Metal'   },
]

/**
 * Hero frame config.
 * translateZ values create multi-plane depth so mouse parallax moves
 * each frame at a different visual rate — the near frames shift more than
 * the far ones, producing a natural stereo-depth showroom feel.
 */
const HERO_FRAMES = [
  {
    borderRadius: '10px',
    translateZ:   20,
    floatDuration: 5.5,
    floatDelay:    0,
    shadow: '0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.18), 0 28px 72px rgba(0,0,0,0.32)',
    glow:   'rgba(192, 100, 80, 0.22)',
    baseTransform: 'rotateY(-7deg) rotateX(4deg)',
  },
  {
    borderRadius: '50%',
    translateZ:   35,
    floatDuration: 6.8,
    floatDelay:    1.4,
    shadow: '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.16), 0 24px 60px rgba(0,0,0,0.28)',
    glow:   'rgba(139, 80, 200, 0.18)',
    baseTransform: 'rotateY(6deg) rotateX(-3deg)',
  },
  {
    borderRadius: '38px',
    translateZ:   50,
    floatDuration: 7.2,
    floatDelay:    0.7,
    shadow: '0 2px 4px rgba(0,0,0,0.10), 0 10px 28px rgba(0,0,0,0.22), 0 32px 80px rgba(0,0,0,0.38)',
    glow:   'rgba(200, 140, 60, 0.20)',
    baseTransform: 'rotateY(-5deg) rotateX(-2deg)',
  },
  {
    border:       '8px solid #5a3e2b',
    borderRadius: '10px',
    translateZ:   30,
    floatDuration: 6.0,
    floatDelay:    2.1,
    shadow: '0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.20), 0 26px 68px rgba(0,0,0,0.34)',
    glow:   'rgba(90, 62, 43, 0.25)',
    baseTransform: 'rotateY(7deg) rotateX(3deg)',
  },
]

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

/* ─── Hero Trust Icons ───────────────────────────────────── */
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/>
  </svg>
)
const IconTruck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="6" width="15" height="10" rx="1"/><path d="M16 10h4l3 4v2h-7V10z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

/* ─── Single Hero Frame ───────────────────────────────────── */
/**
 * Renders one floating frame with:
 * - Framer Motion float animation (translateY loop, unique duration + delay)
 * - Spring-driven parallax derived from parent mouse motion values
 * - Ambient glow blob behind the frame
 * - Contact shadow beneath
 */
function HeroFrame({ frame, index, startIndex, sharedIndexes, springX, springY, photoOverride }) {
  // Map the parent's spring values to a subtle per-frame offset.
  // Near frames (large translateZ) shift more than far ones for natural parallax.
  const depth   = frame.translateZ / 50    // 0.4 – 1.0
  const rotateX = useTransform(springY, v => v * depth * 0.4)
  const rotateY = useTransform(springX, v => v * depth * 0.4)

  // Use material override photos if provided, else fall back to shared pool
  const photos = photoOverride || PHOTO_POOL

  return (
    <motion.div
      style={{
        position:   'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        // Static per-frame 3D tilt — applied as CSS for GPU compositing
        transform:  `${frame.baseTransform} translateZ(${frame.translateZ}px)`,
      }}
      // Framer Motion float animation — each frame at its own speed + delay
      animate={{ y: [0, -13, 0] }}
      transition={{
        duration: frame.floatDuration,
        delay:    frame.floatDelay,
        repeat:   Infinity,
        ease:     'easeInOut',
      }}
    >
      {/* Ambient glow blob */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          inset:        '-30px',
          borderRadius: '50%',
          background:   `radial-gradient(ellipse at 50% 50%, ${frame.glow} 0%, transparent 70%)`,
          filter:       'blur(24px)',
          zIndex:       -1,
          pointerEvents:'none',
        }}
      />

      {/* Contact shadow */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          bottom:       -20,
          left:         '10%',
          width:        '80%',
          height:       20,
          background:   'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(0,0,0,0.32) 0%, transparent 70%)',
          borderRadius: '50%',
          filter:       'blur(6px)',
          pointerEvents:'none',
          zIndex:       -1,
        }}
      />

      {/* Spring parallax wrapper — subtle rotational shift on cursor move */}
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <CyclingFrame
          photos={photos}
          width={140}
          height={175}
          frameStyle={{
            borderRadius: frame.borderRadius,
            border:       frame.border,
          }}
          boxShadow={frame.shadow}
          eager={index === 0}
          pauseWhenHidden
          initialIndex={startIndex}
          cyclePeriod={8000}
          staggerOffset={index * 2000}
          frameSlot={index}
          sharedIndexes={sharedIndexes}
        />
      </motion.div>
    </motion.div>
  )
}


/* ─── Hero Section ────────────────────────────────────────── */
function HeroSection() {
  const navigate = useNavigate()
  const [mounted, setMounted]         = useState(false)
  const [activeMaterial, setActiveMaterial] = useState(null) // null = default PHOTO_POOL
  const heroRef    = useRef(null)
  const shopBtnRef = useRef(null)

  const startIndexes  = useMemo(() => getFrameStartIndexes(4), [])
  const sharedIndexes = useRef([...startIndexes])

  useEffect(() => { setMounted(true) }, [])

  // Raw mouse position as motion values (0 = no movement yet)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring smoothing — slow, physical feel (stiffness 80, damping 20)
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  const handleMouseMove = useCallback((e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(((e.clientX - rect.left) / rect.width  - 0.5) * 10)
    mouseY.set(((e.clientY - rect.top)  / rect.height - 0.5) * 10)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  // ── Magnetic effect for "Shop Now" ────────────────────────
  const handleMagMove = useCallback((e) => {
    const btn = shopBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    const dx = ((e.clientX - cx) / rect.width)  * 5
    const dy = ((e.clientY - cy) / rect.height) * 5
    btn.style.setProperty('--mag-x', `${dx.toFixed(2)}px`)
    btn.style.setProperty('--mag-y', `${dy.toFixed(2)}px`)
  }, [])

  const handleMagLeave = useCallback(() => {
    const btn = shopBtnRef.current
    if (!btn) return
    btn.style.setProperty('--mag-x', '0px')
    btn.style.setProperty('--mag-y', '0px')
  }, [])

  return (
    <section
      ref={heroRef}
      className="hp-hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slow ambient breathing glow behind the entire hero */}
      <motion.div
        className="hp-hero-ambient"
        aria-hidden="true"
        animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.10, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="hp-hero-inner container">
        {/* ── Left — Copy ── */}
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

          {/* Material Toggle Pills */}
          <div className="hp-material-toggle" role="group" aria-label="Filter by material">
            {MATERIAL_PILLS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`hp-material-pill${activeMaterial === key ? ' active' : ''}`}
                onClick={() => setActiveMaterial(activeMaterial === key ? null : key)}
                aria-pressed={activeMaterial === key}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hp-hero-buttons">
            <button
              ref={shopBtnRef}
              type="button"
              id="hero-shop-now-btn"
              className="hp-btn-primary"
              onClick={() => navigate('/products')}
              onMouseMove={handleMagMove}
              onMouseLeave={handleMagLeave}
            >
              Shop Now →
            </button>
            <button type="button" className="hp-btn-outline" onClick={() => navigate('/products')}>
              See All Frames
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

        {/* ── Right — Floating 3D Frames ── */}
        <div className="hp-hero-right">
          <div
            style={{
              perspective:         '1400px',
              perspectiveOrigin:   '50% 50%',
              display:             'grid',
              gridTemplateColumns: 'repeat(2, 140px)',
              gap:                 '24px',
              transformStyle:      'preserve-3d',
            }}
          >
            {HERO_FRAMES.map((frame, i) => (
              <HeroFrame
                key={i}
                frame={frame}
                index={i}
                startIndex={startIndexes[i]}
                sharedIndexes={sharedIndexes}
                springX={springX}
                springY={springY}
                photoOverride={activeMaterial ? MATERIAL_PHOTOS[activeMaterial] : null}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Category Card ───────────────────────────────────────── */
function CategoryCard({ category }) {
  const frameStyle = getCategoryFrameStyle(category)
  return (
    <Link
      to={`/products?category=${category}`}
      className="hp-category-card"
      aria-label={`Browse ${CATEGORY_LABELS[category]} prints`}
    >
      {/* Full-bleed background image — zooms on hover via CSS */}
      <div
        className="hp-category-preview"
        style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS[category]})` }}
      />
      {/* Gradient scrim */}
      <div className="hp-category-preview-overlay" />
      {/* Floating frame preview */}
      <div className="hp-category-frame">
        <CyclingFrame
          photos={SAMPLE_PHOTOS}
          width={110}
          height={140}
          frameStyle={{
            borderRadius: frameStyle.borderRadius,
            border:       frameStyle.border,
            boxShadow:    '0 8px 32px rgba(0,0,0,0.25)',
          }}
        />
      </div>
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
