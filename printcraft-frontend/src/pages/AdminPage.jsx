import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import Logo from '../components/Logo'
import { isLoggedIn, isAdmin } from '../utils/jwt'
import { formatINR, CATEGORY_LABELS, FRAME_LABELS, ORDER_STATUS_BADGE, PAYMENT_STATUS_BADGE, ALL_CATEGORIES, ALL_FRAMES } from '../utils/format'

// Mock chart data
const CHART_DATA = [
  { day: 'Mon', orders: 12 }, { day: 'Tue', orders: 19 }, { day: 'Wed', orders: 8 },
  { day: 'Thu', orders: 25 }, { day: 'Fri', orders: 31 }, { day: 'Sat', orders: 44 }, { day: 'Sun', orders: 28 },
]

// ── Dashboard ──
function AdminDashboard({ products }) {
  const activeProducts = products.filter((p) => p.productActive || p.isProductActive)
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div className="stats-grid">
        {[
          { icon: '📦', label: 'Total Products', value: products.length },
          { icon: '✅', label: 'Active Products', value: activeProducts.length },
          { icon: '📋', label: 'Total Orders', value: '—' },
          { icon: '💰', label: 'Revenue', value: '—' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--divider)', marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Orders — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f2" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#C0392B" strokeWidth={2.5} dot={{ fill: '#C0392B', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Low stock */}
      {products.filter((p) => (p.stockQuantity ?? 0) <= 5).length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 'var(--radius-md)', padding: 16 }}>
          <h4 style={{ color: '#92400E', fontWeight: 700, marginBottom: 8 }}>⚠️ Low Stock Alerts</h4>
          {products.filter((p) => (p.stockQuantity ?? 0) <= 5).map((p) => (
            <div key={p.id} style={{ fontSize: 13, color: '#92400E', marginBottom: 4 }}>
              {p.productName} — Stock: {p.stockQuantity ?? 0}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Product Management ──
function AdminProducts({ products, setProducts }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ productName: '', productCatagories: 'TILES', description: '', frameTypes: 'PORTRAIT', imageUrl: '' })
  const [creating, setCreating] = useState(false)
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/api/admin/products', form)
      toast.success('Product created!')
      setShowModal(false)
      // Refresh
      const res = await api.get('/api/products')
      setProducts(res.data)
    } catch { toast.error('Failed to create product') }
    finally { setCreating(false) }
  }

  const handleToggle = async (id) => {
    try {
      await api.patch(`/api/admin/products/${id}/status`)
      toast.success('Status updated!')
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, productActive: !p.productActive, isProductActive: !(p.productActive ?? p.isProductActive) } : p))
    } catch { toast.error('Failed to update status') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700 }}>Product Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-product-btn">+ Add New Product</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Frame</th><th>Stock</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const active = p.productActive ?? p.isProductActive
              return (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>
                    <img className="admin-thumbnail" src={p.imageUrl || 'https://placehold.co/44x44'} alt={p.productName}
                      onError={(e) => { e.target.src = 'https://placehold.co/44x44/f9f9f9/ccc?text=P' }} />
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 180 }}>{p.productName}</td>
                  <td><span className="badge badge-grey">{CATEGORY_LABELS[p.productCatagories]}</span></td>
                  <td><span className="badge badge-grey">{FRAME_LABELS[p.frameTypes]}</span></td>
                  <td>{p.stockQuantity ?? 0}</td>
                  <td>
                    <span className={`badge ${active ? 'badge-green' : 'badge-red'}`}>
                      {active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(p.id)}>
                      {active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button className="cart-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.productName} onChange={set('productName')} required placeholder="e.g. Premium Glass Panel" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.productCatagories} onChange={set('productCatagories')}>
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frame Type *</label>
                  <select className="form-input" value={form.frameTypes} onChange={set('frameTypes')}>
                    {ALL_FRAMES.map((f) => <option key={f} value={f}>{FRAME_LABELS[f]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} placeholder="Brief product description..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL *</label>
                  <input className="form-input" value={form.imageUrl} onChange={set('imageUrl')} required placeholder="https://..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} id="create-product-btn">
                  {creating ? <Spinner size="sm" white /> : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Order Management ──
function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    api.get('/api/admin/orders')
      .then((r) => setOrders(r.data))
      .catch(() => { toast.error('Failed to fetch orders') })
      .finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus })
      toast.success('Order status updated!')
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    } catch { toast.error('Failed to update status') }
  }

  const filtered = filterStatus === 'ALL' ? orders : orders.filter((o) => o.orderStatus === filterStatus)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700 }}>Order Management</h1>
        <select className="form-input" style={{ width: 'auto', minWidth: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All Orders</option>
          {['PLACED','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <Spinner center /> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th><th>User</th><th>Product</th><th>Price</th>
                <th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} style={{ cursor: 'pointer' }}>
                  <td>#{o.id}</td>
                  <td style={{ fontSize: 12 }}>{o.user?.phoneNo || '—'}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product?.productName || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(o.finalPrice)}</td>
                  <td><span className={`badge ${PAYMENT_STATUS_BADGE[o.paymentStatus] || 'badge-grey'}`}>{o.paymentStatus}</span></td>
                  <td><span className={`badge ${ORDER_STATUS_BADGE[o.orderStatus] || 'badge-grey'}`}>{o.orderStatus}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(o)}>View</button>
                    <select
                      className="form-input"
                      style={{ fontSize: 11, padding: '4px 6px', height: 28, width: 'auto' }}
                      value={o.orderStatus}
                      onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {['PLACED','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders found</div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order #{selectedOrder.id} Details</h3>
              <button className="cart-close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><strong>User:</strong> {selectedOrder.user?.phoneNo}</div>
                <div><strong>Product:</strong> {selectedOrder.product?.productName}</div>
                <div><strong>Size:</strong> {selectedOrder.productSizeInches}</div>
                <div><strong>Thickness:</strong> {selectedOrder.productThickness}</div>
                <div><strong>Frame:</strong> {selectedOrder.frameTypes}</div>
                <div><strong>Border:</strong> <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: selectedOrder.borderColor, display: 'inline-block', border: '1px solid #eee' }} />{selectedOrder.borderColor}</span></div>
                <div><strong>Base Price:</strong> {formatINR(selectedOrder.basePrice)}</div>
                <div><strong>Final Price:</strong> {formatINR(selectedOrder.finalPrice)}</div>
                <div><strong>Payment Status:</strong> <span className={`badge ${PAYMENT_STATUS_BADGE[selectedOrder.paymentStatus]}`}>{selectedOrder.paymentStatus}</span></div>
                <div><strong>Order Status:</strong> <span className={`badge ${ORDER_STATUS_BADGE[selectedOrder.orderStatus]}`}>{selectedOrder.orderStatus}</span></div>
              </div>
              {selectedOrder.paymentId && <div><strong>Payment ID:</strong> {selectedOrder.paymentId}</div>}
              {selectedOrder.deliveryAddressSnapshot && <div><strong>Delivery Address:</strong> {selectedOrder.deliveryAddressSnapshot}</div>}
              {selectedOrder.customImageUrl && (
                <div>
                  <strong>Custom Image:</strong>
                  <img src={selectedOrder.customImageUrl} alt="Custom" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin Layout ──
export default function AdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      navigate('/', { replace: true })
      return
    }
    api.get('/api/products')
      .then((r) => setProducts(r.data))
      .finally(() => setProductsLoaded(true))
  }, [navigate])

  const section = location.pathname.endsWith('/products') ? 'products'
    : location.pathname.endsWith('/orders') ? 'orders'
    : 'dashboard'

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Logo size={18} color="#fff" />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Admin Panel</div>
        </div>
        {[
          { key: 'dashboard', label: '📊 Dashboard', path: '/admin' },
          { key: 'products',  label: '📦 Products',  path: '/admin/products' },
          { key: 'orders',    label: '📋 Orders',    path: '/admin/orders' },
        ].map((item) => (
          <button
            key={item.key}
            className={`admin-sidebar-link${section === item.key ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
        <button className="admin-sidebar-link" onClick={() => { localStorage.removeItem('printcraft_token'); navigate('/') }} style={{ color: '#EF4444', marginTop: 'auto' }}>
          🚪 Logout
        </button>
      </aside>

      {/* Content */}
      <main className="admin-content">
        <Routes>
          <Route index element={productsLoaded ? <AdminDashboard products={products} /> : <Spinner center />} />
          <Route path="products" element={productsLoaded ? <AdminProducts products={products} setProducts={setProducts} /> : <Spinner center />} />
          <Route path="orders" element={<AdminOrders />} />
        </Routes>
      </main>
    </div>
  )
}
