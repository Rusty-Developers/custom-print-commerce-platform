import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import { formatINR } from '../../utils/format'
import { isProductActive } from './adminUtils'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [pendingMods, setPendingMods] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      api.get('/api/products'),
      api.get('/admin/orders'),
      api.get('/api/admin/modifications/pending'),
    ])
      .then(([pr, or, mr]) => {
        setProducts(pr.data || [])
        setOrders(or.data || [])
        setPendingMods((mr.data || []).length)
      })
      .catch(() => {
        setError(true)
        toast.error('Failed to load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner center />
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
        Could not load dashboard. Please refresh the page.
      </div>
    )
  }

  const revenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + parseFloat(o.finalPrice || 0), 0)

  const lowStock = products.filter((p) => (p.stockQuantity ?? 0) <= 5)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div className="stats-grid">
        {[
          { icon: '📦', label: 'Total Products', value: products.length },
          { icon: '📋', label: 'Total Orders', value: orders.length },
          { icon: '💰', label: 'Revenue', value: formatINR(revenue) },
          { icon: '✏️', label: 'Pending Modifications', value: pendingMods },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Low Stock Alerts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {lowStock.map((p) => (
              <div key={p.id} style={{
                background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12,
                padding: 16, fontSize: 14, color: '#92400E',
              }}>
                <div style={{ fontWeight: 700 }}>{p.productName}</div>
                <div style={{ marginTop: 4 }}>Stock: {p.stockQuantity ?? 0} units</div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                  Status: {isProductActive(p) ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
