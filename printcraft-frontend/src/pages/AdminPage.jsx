import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import useStore from '../store/useStore'
import Logo from '../components/Logo'
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
          <Logo size={18} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Admin Panel</div>
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
