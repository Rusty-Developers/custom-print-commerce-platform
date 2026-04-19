import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { isLoggedIn } from '../utils/jwt'
import Logo from './Logo'
import { CATEGORY_LABELS, CATEGORY_ICONS, ALL_CATEGORIES } from '../utils/format'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const megaRef = useRef(null)
  const navigate = useNavigate()

  const cart = useStore((s) => s.cart)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0)
  const loggedIn = isLoggedIn()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mega when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Logo size={24} />
        </Link>

        {/* Nav links */}
        <ul className="navbar-nav">
          <li className="navbar-nav-item">
            <NavLink to="/" className={({ isActive }) => `navbar-nav-link${isActive ? ' active' : ''}`}>
              Home
            </NavLink>
          </li>

          {/* Products with mega dropdown */}
          <li className="navbar-nav-item" ref={megaRef}>
            <span
              className="navbar-nav-link"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => navigate('/products')}
              style={{ cursor: 'pointer' }}
            >
              Products
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
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

          <li className="navbar-nav-item">
            <NavLink to="/about" className={({ isActive }) => `navbar-nav-link${isActive ? ' active' : ''}`}>
              About
            </NavLink>
          </li>
          <li className="navbar-nav-item">
            <NavLink to="/contact" className={({ isActive }) => `navbar-nav-link${isActive ? ' active' : ''}`}>
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right actions */}
        <div className="navbar-actions">
          <button className="navbar-icon-btn" title="Search" onClick={() => navigate('/products')}>
            🔍
          </button>
          <button
            className="navbar-icon-btn"
            title="Account"
            onClick={() => navigate(loggedIn ? '/account' : '/login')}
          >
            👤
          </button>
          <button
            className="navbar-icon-btn"
            id="cart-icon-btn"
            title="Cart"
            onClick={() => setCartOpen(true)}
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  )
}
