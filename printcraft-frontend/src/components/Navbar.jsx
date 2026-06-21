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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const megaRef = useRef(null)
  const navigate = useNavigate()

  const cartCount = useStore((s) => s.cart.reduce((a, i) => a + i.quantity, 0))
  const setCartOpen = useStore((s) => s.setCartOpen)
  const loggedIn = isLoggedIn()

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

  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
              alt="MK Group Printing"
              height={44}
              style={{ objectFit: 'contain', display: 'block' }}
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

            <li className="navbar-nav-item" ref={megaRef}>
              <span
                className="navbar-nav-link"
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => navigate('/products')}
                style={{ cursor: 'pointer' }}
              >
                Products
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              {megaOpen && (
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
              )}
            </li>
          </ul>

          <div className="navbar-actions">
            <button type="button" className="navbar-icon-btn" title="Search" onClick={() => navigate('/products')}>
              🔍
            </button>
            <button
              type="button"
              className="navbar-icon-btn"
              title="Account"
              onClick={() => navigate(loggedIn ? '/account' : '/login')}
            >
              👤
            </button>
            <button
              type="button"
              className="navbar-icon-btn"
              id="cart-icon-btn"
              title="Cart"
              onClick={() => setCartOpen(true)}
            >
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
            </button>
            <button
              type="button"
              className="navbar-mobile-toggle"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? '✕' : '☰'}
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
