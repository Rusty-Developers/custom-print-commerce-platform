import { Link } from 'react-router-dom'

/* ─── Social Icon SVGs ───────────────────────────────────── */
function IconFacebook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function IconYouTube() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#1A1A1A" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { icon: <IconFacebook />, label: 'Follow us on Facebook',  href: '#' },
  { icon: <IconInstagram />, label: 'Follow us on Instagram', href: 'https://www.instagram.com/mkgroupprinting?igsh=ZmJhdmYxZjF1OWsz' },
  { icon: <IconX />,        label: 'Follow us on X',         href: '#' },
  { icon: <IconYouTube />,  label: 'Watch us on YouTube',    href: '#' },
]

/* ─── Contact Icon SVGs ──────────────────────────────────── */
function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand-logo">
              <img
                src="/mk-group-logo.svg"
                alt="MK Group Printing"
                width={120}
                height={36}
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="footer-brand-desc">
              MK Group Printing is India&apos;s premium custom print studio. We transform your cherished memories into
              stunning prints on glass, metal, wood, acrylic and more — crafted with passion and delivered
              to your door.
            </p>
            <div className="footer-socials">
              {SOCIAL_LINKS.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="footer-social-btn"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {[
                ['/', 'Home'],
                ['/products', 'All Products'],
                ['/about', 'About Us'],
                ['/contact', 'Contact'],
                ['/account', 'My Account'],
                ['/track', 'Track Order'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              {[
                ['TILES',       'Tiles'],
                ['PVC',         'PVC Prints'],
                ['GLASS',       'Glass'],
                ['METAL',       'Metal'],
                ['WOOD',        'Wood'],
                ['ACRYLIC',     'Acrylic'],
                ['PHOTO_FRAME', 'Photo Frame'],
                ['POSTER',      'Poster'],
                ['CREATIVE',    'Creative'],
              ].map(([cat, label]) => (
                <li key={cat}><Link to={`/products?category=${cat}`}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">Contact Info</h4>
            <div className="footer-contact-item">
              <IconPin />
              <span>Manas Kundu, Girjapara (Kathgada),<br />Dist. Paschim Burdwan,<br />West Bengal – 713347</span>
            </div>
            <div className="footer-contact-item">
              <IconPhone />
              <a href="tel:+919647212171" style={{ color: 'inherit', textDecoration: 'none' }}>+91 96472 12171</a>
            </div>
            <div className="footer-contact-item">
              <IconMail />
              <a href="mailto:mkgroupprinting@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>mkgroupprinting@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copyright">© 2026 MK Group Printing. All rights reserved.</p>
          <div className="footer-razorpay-badge">
            <img
              src="https://razorpay.com/assets/razorpay-glyph.svg"
              alt="Razorpay"
              width={20}
              height={20}
            />
            <span>Payments secured by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
