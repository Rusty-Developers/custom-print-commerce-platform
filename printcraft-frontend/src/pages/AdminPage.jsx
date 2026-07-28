import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import useStore from '../store/useStore'
import adminLogo from '../assets/logopiv/newlogo1.jpeg'
import Spinner from '../components/Spinner'
import { isAdmin } from '../utils/jwt'
import api from '../api/axios'
import AdminDashboard from './admin/AdminDashboard'
import AdminProducts from './admin/AdminProducts'
import AdminPricing from './admin/AdminPricing'
import AdminOrders from './admin/AdminOrders'
import AdminModifications from './admin/AdminModifications'

const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard', path: '/admin' },
  { key: 'products', icon: '📦', label: 'Products', path: '/admin/products' },
  { key: 'pricing', icon: '💰', label: 'Pricing', path: '/admin/pricing' },
  { key: 'orders', icon: '📋', label: 'Orders', path: '/admin/orders' },
  { key: 'modifications', icon: '✏️', label: 'Modifications', path: '/admin/modifications' },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearToken = useStore((s) => s.clearToken)
  const [products, setProducts] = useState([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  useEffect(() => {
    if (!isAdmin()) return
    api.get('/api/products')
      .then((r) => setProducts(r.data || []))
      .finally(() => setProductsLoaded(true))
  }, [])

  if (!isAdmin()) {
    return <Navigate to="/admin/login" replace />
  }

  const section = location.pathname.includes('/products') ? 'products'
    : location.pathname.includes('/pricing') ? 'pricing'
    : location.pathname.includes('/orders') ? 'orders'
    : location.pathname.includes('/modifications') ? 'modifications'
    : 'dashboard'

  const handleLogout = () => {
    clearToken()
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', gridTemplateColumns: '240px 1fr' }}>
      <aside className="admin-sidebar" style={{ background: '#1a1a1a', width: 240, display: 'flex', flexDirection: 'column' }}>
        <div className="admin-sidebar-logo">
          {/* Premium circular logo */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              position: 'relative',
              width: 72,
              height: 72,
              flexShrink: 0,
            }}>
              {/* Animated glow ring */}
              <div style={{
                position: 'absolute',
                inset: -3,
                borderRadius: '50%',
                background: 'conic-gradient(from 180deg, rgba(192,57,43,0.0) 0%, rgba(192,57,43,0.85) 45%, rgba(255,120,90,1) 55%, rgba(192,57,43,0.85) 65%, rgba(192,57,43,0.0) 100%)',
                animation: 'admin-ring-spin 5s linear infinite',
              }} />
              <div style={{
                position: 'relative',
                zIndex: 1,
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2.5px solid rgba(15,5,5,0.98)',
                boxShadow: '0 0 18px rgba(192,57,43,0.40), 0 4px 16px rgba(0,0,0,0.55)',
                background: '#0a0404',
              }}>
                <img
                  src={adminLogo}
                  alt="MK GROUP"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
            </div>
            {/* Brand text */}
            <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.10em',
                color: 'rgba(255,255,255,0.92)',
                textTransform: 'uppercase',
              }}>MK GROUP</div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 4,
                background: 'rgba(192,57,43,0.18)',
                border: '1px solid rgba(192,57,43,0.35)',
                borderRadius: 100,
                padding: '2px 9px',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'rgba(255,160,140,0.90)',
                textTransform: 'uppercase',
              }}>⚙️ Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-sidebar-link${section === item.key ? ' active' : ''}`}
              style={section === item.key ? { background: '#C0392B' } : undefined}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="admin-sidebar-link"
          onClick={handleLogout}
          style={{ color: '#EF4444', marginTop: 'auto' }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-content" style={{ background: '#F5F5F5' }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={
            productsLoaded
              ? <AdminProducts products={products} setProducts={setProducts} />
              : <Spinner center />
          } />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="modifications" element={<AdminModifications />} />
        </Routes>
      </main>
    </div>
  )
}
