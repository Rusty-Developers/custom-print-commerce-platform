import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'
import { isLoggedIn, getPhone } from '../utils/jwt'
import { formatINR, SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS, ORDER_STATUS_BADGE, PAYMENT_STATUS_BADGE } from '../utils/format'

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ fullName: '', phoneNo: '', addressLine: '', landmark: '', city: '', state: '', pinCode: '' })
  const [loading, setLoading] = useState(false)
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/user/addresses', { ...form, pinCode: parseInt(form.pinCode) })
      toast.success('Address saved!')
      onSave(res.data)
    } catch { toast.error('Failed to save address') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.fullName} onChange={set('fullName')} required /></div>
        <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phoneNo} onChange={set('phoneNo')} maxLength={10} required /></div>
      </div>
      <div className="form-group"><label className="form-label">Address Line *</label><input className="form-input" value={form.addressLine} onChange={set('addressLine')} required /></div>
      <div className="form-group"><label className="form-label">Landmark</label><input className="form-input" value={form.landmark} onChange={set('landmark')} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={set('city')} required /></div>
        <div className="form-group"><label className="form-label">State *</label><input className="form-input" value={form.state} onChange={set('state')} required /></div>
        <div className="form-group"><label className="form-label">PIN *</label><input className="form-input" value={form.pinCode} onChange={set('pinCode')} maxLength={6} required /></div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? <Spinner size="sm" white /> : 'Save'}</button>
        {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default function AccountPage() {
  const navigate = useNavigate()
  const clearToken = useStore((s) => s.clearToken)
  const clearCart  = useStore((s) => s.clearCart)

  const [section, setSection]   = useState('profile')
  const [orders, setOrders]     = useState([])
  const [addresses, setAddresses] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [addrLoading, setAddrLoading]     = useState(false)
  const [showAddForm, setShowAddForm]     = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const phone   = getPhone()
  const initials = phone ? phone.slice(-4) : '??'

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login?redirect=/account'); return }
  }, [navigate])

  useEffect(() => {
    if (section === 'orders' && orders.length === 0) {
      setOrdersLoading(true)
      api.get('/api/orders/my')
        .then((r) => setOrders(r.data))
        .catch(() => {})
        .finally(() => setOrdersLoading(false))
    }
    if (section === 'addresses' && addresses.length === 0) {
      setAddrLoading(true)
      api.get('/api/user/addresses')
        .then((r) => setAddresses(r.data))
        .catch(() => {})
        .finally(() => setAddrLoading(false))
    }
  }, [section])

  const handleLogout = () => {
    clearToken()
    clearCart()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const SIDEBAR_ITEMS = [
    { key: 'profile',   label: '👤 Profile',      },
    { key: 'orders',    label: '📦 My Orders',     },
    { key: 'addresses', label: '📍 My Addresses',  },
  ]

  return (
    <div className="page-enter">
      <div className="container">
        <div className="account-layout">
          {/* Sidebar */}
          <div className="account-sidebar">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`account-sidebar-link${section === item.key ? ' active' : ''}`}
                onClick={() => setSection(item.key)}
              >
                {item.label}
              </button>
            ))}
            <button className="account-sidebar-link" onClick={handleLogout} style={{ color: '#EF4444' }}>
              🚪 Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="account-main">

            {/* ── PROFILE ── */}
            {section === 'profile' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Profile</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: 'var(--off-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--divider)', marginBottom: 24 }}>
                  <div className="avatar-lg">{initials}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700 }}>PrintCraft Member</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>📞 +91 {phone}</div>
                    <span className="badge badge-red" style={{ marginTop: 8 }}>Verified Member</span>
                  </div>
                </div>
                <div style={{ padding: 20, background: 'var(--off-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--divider)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, marginBottom: 12 }}>Account Details</h3>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 2 }}>
                    <div>📱 Phone: +91 {phone}</div>
                    <div>🔐 Auth: OTP Based (No password required)</div>
                    <div>✅ Account Status: Active</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDERS ── */}
            {section === 'orders' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Orders</h2>
                {ordersLoading ? <Spinner center /> : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📦</div>
                    <p style={{ color: 'var(--text-muted)' }}>No orders yet. Start customising!</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/products')}>Browse Products</button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Date</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td>#{o.id}</td>
                            <td style={{ fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {o.product?.productName || '—'}
                            </td>
                            <td>{SIZE_LABELS[o.productSizeInches] || o.productSizeInches}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(o.finalPrice)}</td>
                            <td><span className={`badge ${ORDER_STATUS_BADGE[o.orderStatus] || 'badge-grey'}`}>{o.orderStatus}</span></td>
                            <td><span className={`badge ${PAYMENT_STATUS_BADGE[o.paymentStatus] || 'badge-grey'}`}>{o.paymentStatus}</span></td>
                            <td style={{ color: 'var(--text-muted)' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                            <td>
                              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(o)}>Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESSES ── */}
            {section === 'addresses' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Addresses</h2>
                {addrLoading ? <Spinner /> : (
                  <>
                    {addresses.map((addr) => (
                      <div key={addr.id} className="address-card" style={{ marginBottom: 12 }}>
                        <div className="address-card-title">{addr.fullName} · {addr.phoneNo}</div>
                        <div className="address-card-text">
                          {addr.addressLine}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} — {addr.pinCode}
                        </div>
                        {addr.isDefault && <span className="badge badge-green" style={{ marginTop: 6 }}>Default</span>}
                      </div>
                    ))}
                    {!showAddForm ? (
                      <button className="add-address-btn" onClick={() => setShowAddForm(true)}>+ Add New Address</button>
                    ) : (
                      <div style={{ border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: 20, marginTop: 12 }}>
                        <AddressForm
                          onSave={(a) => { setAddresses((p) => [...p, a]); setShowAddForm(false) }}
                          onCancel={() => setShowAddForm(false)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order #{selectedOrder.id}</h3>
              <button className="cart-close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div><strong>Product:</strong> {selectedOrder.product?.productName}</div>
              <div><strong>Size:</strong> {SIZE_LABELS[selectedOrder.productSizeInches]}</div>
              <div><strong>Thickness:</strong> {THICKNESS_LABELS[selectedOrder.productThickness]}</div>
              <div><strong>Frame:</strong> {FRAME_LABELS[selectedOrder.frameTypes]}</div>
              <div><strong>Border Color:</strong> {selectedOrder.borderColor}</div>
              <div><strong>Final Price:</strong> {formatINR(selectedOrder.finalPrice)}</div>
              <div><strong>Status:</strong> <span className={`badge ${ORDER_STATUS_BADGE[selectedOrder.orderStatus]}`}>{selectedOrder.orderStatus}</span></div>
              <div><strong>Payment:</strong> <span className={`badge ${PAYMENT_STATUS_BADGE[selectedOrder.paymentStatus]}`}>{selectedOrder.paymentStatus}</span></div>
              {selectedOrder.deliveryAddressSnapshot && (
                <div><strong>Delivery Address:</strong> {selectedOrder.deliveryAddressSnapshot}</div>
              )}
              {selectedOrder.paymentId && <div><strong>Payment ID:</strong> {selectedOrder.paymentId}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
