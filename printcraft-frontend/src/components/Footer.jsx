import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-logo">
              <Logo size={20} color="#fff" />
            </div>
            <p className="footer-brand-desc">
              MK Group Printing is India's premium custom print studio. We transform your cherished memories into
              stunning prints on glass, metal, wood, acrylic and more — crafted with passion and delivered
              to your door.
            </p>
            <div className="footer-socials">
              {['📘','📸','🐦','▶️'].map((icon, i) => (
                <a key={i} href="#" className="footer-social-btn">{icon}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {[['/',          'Home'],
                ['/products',  'All Products'],
                ['/about',     'About Us'],
                ['/contact',   'Contact'],
                ['/account',   'My Account'],
                ['/track',     'Track Order'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              {[['TILES','Tiles'],['PVC','PVC Prints'],['GLASS','Glass'],
                ['METAL','Metal'],['WOOD','Wood'],['ACRYLIC','Acrylic'],
                ['PHOTO_FRAME','Photo Frame'],['POSTER','Poster'],
                ['CREATIVE','Creative'],
              ].map(([cat, label]) => (
                <li key={cat}><Link to={`/products?category=${cat}`}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">Contact Info</h4>
            <div className="footer-contact-item">
              <span>📍</span>
              <span>42, Craft Lane, Koramangala,<br/>Bengaluru, Karnataka 560034</span>
            </div>
            <div className="footer-contact-item">
              <span>📞</span>
              <span>+91 98765 43210</span>
            </div>
            <div className="footer-contact-item">
              <span>✉️</span>
              <span>hello@mkgroupprinting.in</span>
            </div>
            <div className="footer-contact-item">
              <span>⏰</span>
              <span>Mon–Sat: 9AM – 7PM IST</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>© 2026 MK Group Printing. All rights reserved. &nbsp;|&nbsp; Designed with ❤️ in India</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.85 }}>
            <span>🔒</span>
            <img
              src="https://razorpay.com/assets/razorpay-glyph.svg"
              alt="Razorpay"
              style={{ height: 18, width: 'auto', filter: 'brightness(0) invert(1)' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <span>Payments secured by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
