import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import Logo from '../components/Logo'
import { isLoggedIn, isAdmin } from '../utils/jwt'
import { formatINR, CATEGORY_LABELS, FRAME_LABELS, SIZE_LABELS, THICKNESS_LABELS, ORDER_STATUS_BADGE, PAYMENT_STATUS_BADGE, ALL_CATEGORIES, ALL_FRAMES } from '../utils/format'

const CHART_DATA = [
  { day:'Mon', orders:12 }, { day:'Tue', orders:19 }, { day:'Wed', orders:8 },
  { day:'Thu', orders:25 }, { day:'Fri', orders:31 }, { day:'Sat', orders:44 }, { day:'Sun', orders:28 },
]
const DELIVERY_STATUSES = ['CREATED','PACKED','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','FAILED']

// ── Dashboard ──
function AdminDashboard({ products, orders }) {
  const active = products.filter(p => p.productActive ?? p.isProductActive)
  const revenue = orders.reduce((a, o) => a + (o.finalPrice || 0), 0)
  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:700, marginBottom:24 }}>Dashboard</h1>
      <div className="stats-grid">
        {[
          { icon:'📦', label:'Total Products', value:products.length },
          { icon:'✅', label:'Active Products', value:active.length },
          { icon:'📋', label:'Total Orders', value:orders.length },
          { icon:'💰', label:'Revenue', value:formatINR(revenue) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'white', borderRadius:'var(--radius-md)', padding:24, boxShadow:'var(--shadow-sm)', border:'1px solid var(--divider)', marginBottom:24 }}>
        <h3 style={{ fontFamily:'var(--font-heading)', fontSize:18, fontWeight:700, marginBottom:20 }}>Orders — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f2" />
            <XAxis dataKey="day" tick={{ fontSize:12 }} />
            <YAxis tick={{ fontSize:12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#C0392B" strokeWidth={2.5} dot={{ fill:'#C0392B', r:4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {products.filter(p => (p.stockQuantity ?? 0) <= 5).length > 0 && (
        <div style={{ background:'#FEF3C7', border:'1px solid #F59E0B', borderRadius:'var(--radius-md)', padding:16 }}>
          <h4 style={{ color:'#92400E', fontWeight:700, marginBottom:8 }}>⚠️ Low Stock Alerts</h4>
          {products.filter(p => (p.stockQuantity ?? 0) <= 5).map(p => (
            <div key={p.id} style={{ fontSize:13, color:'#92400E', marginBottom:4 }}>{p.productName} — Stock: {p.stockQuantity ?? 0}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Products ──
function AdminProducts({ products, setProducts }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ productName:'', productCatagories:'TILES', description:'', frameTypes:'PORTRAIT', imageUrl:'' })
  const [creating, setCreating] = useState(false)
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true)
    try { await api.post('/api/admin/products', form); toast.success('Product created!'); setShowModal(false); const res = await api.get('/api/products'); setProducts(res.data) }
    catch { toast.error('Failed to create product') } finally { setCreating(false) }
  }
  const handleToggle = async (id) => {
    try { await api.patch(`/api/admin/products/${id}/status`); toast.success('Status updated!')
      setProducts(prev => prev.map(p => p.id===id ? { ...p, productActive:!(p.productActive??p.isProductActive), isProductActive:!(p.productActive??p.isProductActive) } : p))
    } catch { toast.error('Failed to update status') }
  }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:700 }}>Product Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-product-btn">+ Add New Product</button>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Frame</th><th>Stock</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>{products.map(p => { const active = p.productActive ?? p.isProductActive; return (
            <tr key={p.id}>
              <td>#{p.id}</td>
              <td><img className="admin-thumbnail" src={p.imageUrl||'https://placehold.co/44x44'} alt={p.productName} onError={e=>e.target.src='https://placehold.co/44x44/f9f9f9/ccc?text=P'} /></td>
              <td style={{ fontWeight:600, maxWidth:180 }}>{p.productName}</td>
              <td><span className="badge badge-grey">{CATEGORY_LABELS[p.productCatagories]}</span></td>
              <td><span className="badge badge-grey">{FRAME_LABELS[p.frameTypes]}</span></td>
              <td>{p.stockQuantity ?? 0}</td>
              <td><span className={`badge ${active?'badge-green':'badge-red'}`}>{active?'Active':'Inactive'}</span></td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => handleToggle(p.id)}>{active?'Deactivate':'Activate'}</button></td>
            </tr>
          )})}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Add New Product</h3><button className="cart-close-btn" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-group"><label className="form-label">Product Name *</label><input className="form-input" value={form.productName} onChange={set('productName')} required placeholder="e.g. Premium Glass Panel" /></div>
                <div className="form-group"><label className="form-label">Category *</label><select className="form-input" value={form.productCatagories} onChange={set('productCatagories')}>{ALL_CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Frame Type *</label><select className="form-input" value={form.frameTypes} onChange={set('frameTypes')}>{ALL_FRAMES.map(f=><option key={f} value={f}>{FRAME_LABELS[f]}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input form-textarea" value={form.description} onChange={set('description')} placeholder="Brief product description..." /></div>
                <div className="form-group"><label className="form-label">Image URL *</label><input className="form-input" value={form.imageUrl} onChange={set('imageUrl')} required placeholder="https://..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} id="create-product-btn">{creating ? <Spinner size="sm" white /> : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Orders ──
function AdminOrders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterOrderId, setFilterOrderId]   = useState('')
  const [selectedOrder, setSelectedOrder]   = useState(null)
  const [deliveryModal, setDeliveryModal]   = useState(null)
  const [dlvForm, setDlvForm] = useState({ trackingId:'', newStatus:'PACKED', location:'' })
  const [dlvSubmitting, setDlvSubmitting] = useState(false)

  const fetchOrders = () => {
    setLoading(true)
    const p = {}
    if (filterStatus) p.orderStatus = filterStatus
    if (filterPayment) p.paymentStatus = filterPayment
    if (filterCustomer) p.customer = filterCustomer
    if (filterOrderId) p.orderId = filterOrderId
    api.get('/admin/orders', { params: p }).then(r => setOrders(r.data || [])).catch(() => toast.error('Failed to fetch orders')).finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [filterStatus, filterPayment, filterCustomer, filterOrderId])

  const handleDeliveryUpdate = async () => {
    if (!dlvForm.trackingId) { toast.error('Tracking ID required'); return }
    setDlvSubmitting(true)
    try { await api.patch('/api/admin/delivery/updateStatus', dlvForm); toast.success('Delivery status updated!'); setDeliveryModal(null); fetchOrders() }
    catch { toast.error('Failed to update delivery status') } finally { setDlvSubmitting(false) }
  }

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:700, marginBottom:16 }}>Order Management</h1>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <select className="form-input" style={{ width:160 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['PLACED','CONFIRMED','MODIFICATION_ALLOWED','PROCESSING','SHIPPED','DELIVERED'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-input" style={{ width:150 }} value={filterPayment} onChange={e=>setFilterPayment(e.target.value)}>
          <option value="">All Payments</option>
          {['PENDING','PAID','FAILED'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <input className="form-input" style={{ width:180 }} placeholder="Customer name..." value={filterCustomer} onChange={e=>setFilterCustomer(e.target.value)} />
        <input className="form-input" style={{ width:120 }} placeholder="Order ID..." value={filterOrderId} onChange={e=>setFilterOrderId(e.target.value)} />
      </div>
      {loading ? <Spinner center /> : (
        <div style={{ overflowX:'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Size+Thickness</th><th>Frame</th><th>Price</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td style={{ fontSize:12 }}>{o.user?.phoneNo||o.user?.name||'—'}</td>
                  <td style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.product?.productName||'—'}</td>
                  <td style={{ fontSize:12 }}>{SIZE_LABELS[o.productSizeInches]||o.productSizeInches} · {THICKNESS_LABELS[o.productThickness]||o.productThickness}</td>
                  <td style={{ fontSize:12 }}>{FRAME_LABELS[o.frameTypes]||o.frameTypes}</td>
                  <td style={{ fontWeight:700, color:'var(--primary)' }}>{formatINR(o.finalPrice)}</td>
                  <td><span className={`badge ${PAYMENT_STATUS_BADGE[o.paymentStatus]||'badge-grey'}`}>{o.paymentStatus}</span></td>
                  <td><span className={`badge ${ORDER_STATUS_BADGE[o.orderStatus]||'badge-grey'}`}>{o.orderStatus}</span></td>
                  <td style={{ fontSize:11, color:'var(--text-muted)' }}>{o.createdAt?new Date(o.createdAt).toLocaleDateString('en-IN'):'—'}</td>
                  <td style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(o)}>View</button>
                    <button className="btn btn-outline btn-sm" style={{ fontSize:11 }} onClick={() => { setDeliveryModal(o); setDlvForm(f => ({ ...f, trackingId:'' })) }}>📦 Delivery</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No orders found</div>}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ maxWidth:600 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Order #{selectedOrder.id}</h3><button className="cart-close-btn" onClick={() => setSelectedOrder(null)}>✕</button></div>
            <div className="modal-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:14 }}>
              <div><strong>User:</strong> {selectedOrder.user?.phoneNo}</div>
              <div><strong>Product:</strong> {selectedOrder.product?.productName}</div>
              <div><strong>Size:</strong> {SIZE_LABELS[selectedOrder.productSizeInches]}</div>
              <div><strong>Thickness:</strong> {THICKNESS_LABELS[selectedOrder.productThickness]}</div>
              <div><strong>Frame:</strong> {FRAME_LABELS[selectedOrder.frameTypes]}</div>
              <div><strong>Border:</strong> <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><span style={{ width:12,height:12,borderRadius:'50%',background:selectedOrder.borderColor,display:'inline-block',border:'1px solid #eee' }}/>{selectedOrder.borderColor}</span></div>
              <div><strong>Final Price:</strong> {formatINR(selectedOrder.finalPrice)}</div>
              <div><strong>Payment:</strong> <span className={`badge ${PAYMENT_STATUS_BADGE[selectedOrder.paymentStatus]}`}>{selectedOrder.paymentStatus}</span></div>
              {selectedOrder.deliveryAddressSnapshot && <div style={{ gridColumn:'1/-1' }}><strong>Address:</strong> {selectedOrder.deliveryAddressSnapshot}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Status Modal */}
      {deliveryModal && (
        <div className="modal-overlay" onClick={() => setDeliveryModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Update Delivery — #{deliveryModal.id}</h3><button className="cart-close-btn" onClick={() => setDeliveryModal(null)}>✕</button></div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Tracking ID *</label><input className="form-input" value={dlvForm.trackingId} onChange={e=>setDlvForm(f=>({...f,trackingId:e.target.value}))} placeholder="TRK-..." /></div>
              <div className="form-group"><label className="form-label">New Status *</label><select className="form-input" value={dlvForm.newStatus} onChange={e=>setDlvForm(f=>({...f,newStatus:e.target.value}))}>{DELIVERY_STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={dlvForm.location} onChange={e=>setDlvForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Mumbai Hub" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeliveryModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={dlvSubmitting} onClick={handleDeliveryUpdate}>{dlvSubmitting?<Spinner size="sm" white />:'Update Status'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modifications ──
function AdminModifications() {
  const [mods, setMods]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [detailMod, setDetailMod] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchMods = () => {
    setLoading(true)
    api.get('/api/admin/modifications/pending').then(r => setMods(r.data || [])).catch(() => toast.error('Failed to fetch modifications')).finally(() => setLoading(false))
  }
  useEffect(() => { fetchMods() }, [])

  const handleApprove = async (id) => {
    try { await api.put(`/api/admin/modifications/${id}/approve`); toast.success('Approved!'); fetchMods() }
    catch { toast.error('Failed to approve') }
  }
  const handleReject = async (id) => {
    try { await api.put(`/api/admin/modifications/${id}/reject`); toast.success('Rejected!'); fetchMods() }
    catch { toast.error('Failed to reject') }
  }
  const viewDetail = async (id) => {
    setDetailLoading(true)
    try { const r = await api.get(`/api/admin/modifications/${id}`); setDetailMod(r.data) }
    catch { toast.error('Failed to load detail') } finally { setDetailLoading(false) }
  }

  const parseChanges = (mod) => {
    const changes = []
    if (mod.newSize && mod.newSize !== mod.currentSize) changes.push(`Size: ${SIZE_LABELS[mod.currentSize]||mod.currentSize} → ${SIZE_LABELS[mod.newSize]||mod.newSize}`)
    if (mod.newFrame && mod.newFrame !== mod.currentFrame) changes.push(`Frame: ${FRAME_LABELS[mod.currentFrame]||mod.currentFrame} → ${FRAME_LABELS[mod.newFrame]||mod.newFrame}`)
    if (mod.newThickness && mod.newThickness !== mod.currentThickness) changes.push(`Thickness: ${THICKNESS_LABELS[mod.currentThickness]||mod.currentThickness} → ${THICKNESS_LABELS[mod.newThickness]||mod.newThickness}`)
    return changes.length ? changes.join(' | ') : 'No changes specified'
  }

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:700, marginBottom:24 }}>Modification Requests</h1>
      {loading ? <Spinner center /> : (
        <div style={{ overflowX:'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Request ID</th><th>Order ID</th><th>Customer</th><th>Requested Changes</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {mods.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No pending modifications</td></tr>}
              {mods.map(m => (
                <tr key={m.id}>
                  <td>#{m.id}</td>
                  <td>#{m.orderId}</td>
                  <td style={{ fontSize:12 }}>{m.user?.phoneNo||m.customerName||'—'}</td>
                  <td style={{ fontSize:12, maxWidth:200 }}>{parseChanges(m)}</td>
                  <td><span className={`badge ${m.status==='PENDING'?'badge-amber':m.status==='APPROVED'?'badge-green':'badge-red'}`}>{m.status}</span></td>
                  <td style={{ fontSize:11, color:'var(--text-muted)' }}>{m.createdAt?new Date(m.createdAt).toLocaleDateString('en-IN'):'—'}</td>
                  <td style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(m.id)}>View</button>
                    {m.status === 'PENDING' && <>
                      <button className="btn btn-sm" style={{ background:'#DCFCE7', color:'#166534', border:'none' }} onClick={() => handleApprove(m.id)}>✓ Approve</button>
                      <button className="btn btn-sm" style={{ background:'#FEE2E2', color:'#991B1B', border:'none' }} onClick={() => handleReject(m.id)}>✗ Reject</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(detailMod || detailLoading) && (
        <div className="modal-overlay" onClick={() => setDetailMod(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Modification Detail</h3><button className="cart-close-btn" onClick={() => setDetailMod(null)}>✕</button></div>
            <div className="modal-body">
              {detailLoading ? <Spinner center /> : detailMod && (
                <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:14 }}>
                  <div><strong>Request ID:</strong> #{detailMod.id}</div>
                  <div><strong>Order ID:</strong> #{detailMod.orderId}</div>
                  <div><strong>Status:</strong> <span className={`badge ${detailMod.status==='PENDING'?'badge-amber':detailMod.status==='APPROVED'?'badge-green':'badge-red'}`}>{detailMod.status}</span></div>
                  <div><strong>Changes:</strong> {parseChanges(detailMod)}</div>
                  {detailMod.adminNote && <div><strong>Admin Note:</strong> {detailMod.adminNote}</div>}
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
  const [products, setProducts]     = useState([])
  const [orders, setOrders]         = useState([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { navigate('/', { replace:true }); return }
    Promise.all([api.get('/api/products'), api.get('/admin/orders')])
      .then(([pr, or]) => { setProducts(pr.data || []); setOrders(or.data || []) })
      .finally(() => setProductsLoaded(true))
  }, [navigate])

  const section = location.pathname.includes('/products') ? 'products'
    : location.pathname.includes('/orders') ? 'orders'
    : location.pathname.includes('/modifications') ? 'modifications'
    : 'dashboard'

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Logo size={18} color="#fff" />
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>Admin Panel</div>
        </div>
        {[
          { key:'dashboard',     label:'📊 Dashboard',    path:'/admin' },
          { key:'products',      label:'📦 Products',     path:'/admin/products' },
          { key:'orders',        label:'📋 Orders',       path:'/admin/orders' },
          { key:'modifications', label:'✏️ Modifications', path:'/admin/modifications' },
        ].map(item => (
          <button key={item.key} className={`admin-sidebar-link${section===item.key?' active':''}`} onClick={() => navigate(item.path)}>
            {item.label}
          </button>
        ))}
        <button className="admin-sidebar-link" onClick={() => { localStorage.removeItem('printcraft_token'); navigate('/') }} style={{ color:'#EF4444', marginTop:'auto' }}>
          🚪 Logout
        </button>
      </aside>
      <main className="admin-content">
        <Routes>
          <Route index element={productsLoaded ? <AdminDashboard products={products} orders={orders} /> : <Spinner center />} />
          <Route path="products" element={productsLoaded ? <AdminProducts products={products} setProducts={setProducts} /> : <Spinner center />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="modifications" element={<AdminModifications />} />
        </Routes>
      </main>
    </div>
  )
}
