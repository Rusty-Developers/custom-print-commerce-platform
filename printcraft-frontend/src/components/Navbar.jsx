import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { isLoggedIn } from '../utils/jwt'
import { CATEGORY_LABELS, CATEGORY_ICONS, ALL_CATEGORIES } from '../utils/format'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/track', label: 'Track Order' },
]

/* ─── Inline SVG Icons ───────────────────────────────────── */
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconCart() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M2 4l4 4 4-4" />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [megaOpen, setMegaOpen]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const megaRef  = useRef(null)
  const navigate = useNavigate()

  const cartCount  = useStore((s) => s.cart.reduce((a, i) => a + i.quantity, 0))
  const setCartOpen = useStore((s) => s.setCartOpen)
  const loggedIn   = isLoggedIn()

  useEffect(() => {
    const t = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close mega menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mega menu on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setMegaOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link
            to="/"
            className="navbar-logo"
            style={{ opacity: logoVisible ? 1 : 0, transition: 'opacity 300ms ease' }}
            onClick={closeMobile}
          >
            <img
              src="/mk-group-logo.png"
              alt="MK Group Logo"
              style={{
                height: '44px',
                width: 'auto',
                maxWidth: '180px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <span className="navbar-brand-name">MK Group Printing</span>
          </Link>

          <ul className="navbar-nav">
            {NAV_LINKS.map(({ to, label, end }) => (
              <li key={to} className="navbar-nav-item">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `navbar-nav-link${isActive ? ' active' : ''}`}
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {/* Products mega menu */}
            <li className="navbar-nav-item" ref={megaRef}>
              <span
                className="navbar-nav-link"
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => navigate('/products')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setMegaOpen((o) => !o)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={megaOpen}
                style={{ cursor: 'pointer' }}
              >
                Products
                <IconChevron />
              </span>
              {megaOpen && (
                // 2px gap + invisible bridge div eliminates the hover dead zone
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '2px' }}>
                  <div className="mega-dropdown" onMouseLeave={() => setMegaOpen(false)}>
                    {ALL_CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        to={`/products?category=${cat}`}
                        className="mega-dropdown-item"
                        onClick={() => setMegaOpen(false)}
                      >
                        <span className="mega-dropdown-icon">{CATEGORY_ICONS[cat]}</span>
                        <span>{CATEGORY_LABELS[cat]}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          </ul>

          <div className="navbar-actions">
            <button
              type="button"
              className="navbar-icon-btn"
              aria-label="Search products"
              onClick={() => navigate('/products')}
            >
              <IconSearch />
            </button>
            <button
              type="button"
              className="navbar-icon-btn"
              aria-label={loggedIn ? 'My account' : 'Sign in'}
              onClick={() => navigate(loggedIn ? '/account' : '/login')}
            >
              <IconUser />
            </button>
            <button
              type="button"
              className="navbar-icon-btn"
              id="cart-icon-btn"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : ', empty'}`}
              onClick={() => setCartOpen(true)}
            >
              <IconCart />
              {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount > 9 ? '9+' : cartCount}</span>}
            </button>
            <button
              type="button"
              className="navbar-mobile-toggle"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div className="navbar-mobile-overlay" onClick={closeMobile} aria-hidden="true" />
          <div className="navbar-mobile-menu" role="dialog" aria-label="Navigation menu">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`}
                onClick={closeMobile}
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/products"
              className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`}
              onClick={closeMobile}
            >
              All Products
            </NavLink>
            <div className="navbar-mobile-categories">
              {ALL_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="navbar-mobile-cat"
                  onClick={closeMobile}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
