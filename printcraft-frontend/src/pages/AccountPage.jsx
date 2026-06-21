import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'
import { isLoggedIn, getPhone, getName } from '../utils/jwt'
import { formatINR, SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS, ORDER_STATUS_BADGE, PAYMENT_STATUS_BADGE, DELIVERY_STATUS_LABELS, DELIVERY_STATUS_BADGE, ALL_SIZES, ALL_THICKNESSES, ALL_FRAMES } from '../utils/format'
import AddressForm from '../components/AddressForm'

const DELIVERY_STEPS = ['CREATED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED']
const PLACEHOLDER_IMAGE = 'https://placehold.co/80x80/f9f9f9/ccc?text=Print'

function TrackingModal({ order, onClose }) {
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get(`/api/tracking/${order.id}`)
      .then((r) => setTracking(r.data))
      .catch(() => { setTracking(null); setError(true) })
      .finally(() => setLoading(false))
  }, [order.id])

  const currentStatus = tracking?.currentStatus
  const isFailed = currentStatus === 'FAILED_FINAL' || currentStatus === 'RTO_INITIATED'
  const isAttempted = currentStatus === 'DELIVERY_ATTEMPTED'

  const currentStepIdx = tracking ? (() => {
    if (isFailed) return DELIVERY_STEPS.indexOf('OUT_FOR_DELIVERY')
    if (isAttempted) return DELIVERY_STEPS.indexOf('OUT_FOR_DELIVERY')
    const idx = DELIVERY_STEPS.indexOf(currentStatus)
    return idx >= 0 ? idx : -1
  })() : -1

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Order Tracking — #{order.id}</h3>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? <Spinner center /> : error || !tracking ? (
            <p style={{ color:'var(--text-muted)' }}>Tracking info not available yet.</p>
          ) : (
            <>
              {isFailed && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA' }}>
                  <span className={`badge ${DELIVERY_STATUS_BADGE[currentStatus] || 'badge-red'}`} style={{ marginBottom:6 }}>
                    {DELIVERY_STATUS_LABELS[currentStatus] || currentStatus}
                  </span>
                  <div style={{ fontSize:13, color:'#991B1B' }}>
                    {currentStatus === 'RTO_INITIATED'
                      ? 'Your package is being returned to our facility.'
                      : 'Delivery could not be completed. Please contact support.'}
                  </div>
                </div>
              )}
              {isAttempted && !isFailed && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:8, background:'#FFFBEB', border:'1px solid #FDE68A', fontSize:13, color:'#92400E' }}>
                  {DELIVERY_STATUS_LABELS.DELIVERY_ATTEMPTED} — courier will retry delivery soon.
                </div>
              )}
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', marginBottom:16, padding:'12px 16px', background:'var(--off-white)', borderRadius:8 }}>
                <div>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>Order ID</span>
                  <div style={{ fontWeight:700, fontFamily:'monospace', fontSize:15 }}>#{tracking.orderId || order.id}</div>
                </div>
                {tracking.location && (
                  <div>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>Location</span>
                    <div style={{ fontWeight:600, fontSize:14 }}>{tracking.location}</div>
                  </div>
                )}
              </div>
              {tracking.estimatedDeliveryDate && (
                <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
                  Estimated delivery: <strong>{new Date(tracking.estimatedDeliveryDate).toLocaleDateString('en-IN', { day:'numeric', month:'long' })}</strong>
                </div>
              )}
              <div style={{ position:'relative', paddingLeft:28 }}>
                {DELIVERY_STEPS.map((step, i) => {
                  const done = !isFailed && i < currentStepIdx
                  const current = !isFailed && i === currentStepIdx
                  const event = tracking.eventDTOS?.find(e => e.status === step)
                  const attemptedHere = isAttempted && step === 'OUT_FOR_DELIVERY'
                  return (
                    <div key={step} style={{ marginBottom:20, position:'relative' }}>
                      <div style={{ position:'absolute', left:-28, top:0, width:18, height:18, borderRadius:'50%',
                        background: done || current || attemptedHere ? '#C0392B' : '#E5E7EB',
                        border:`2px solid ${done || current || attemptedHere ? '#C0392B' : '#D1D5DB'}`,
                        animation: current || attemptedHere ? 'pulse 1.5s infinite' : 'none',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {done && <span style={{ color:'white', fontSize:10, lineHeight:1 }}>✓</span>}
                      </div>
                      {i < DELIVERY_STEPS.length - 1 && (
                        <div style={{ position:'absolute', left:-20, top:18, width:2, height:24, background: done ? '#C0392B' : '#E5E7EB' }} />
                      )}
                      <div style={{ fontWeight:600, fontSize:13, color: done || current || attemptedHere ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                        {DELIVERY_STATUS_LABELS[step] || step.replace(/_/g, ' ')}
                      </div>
                      {attemptedHere && (
                        <div style={{ fontSize:12, color:'#B45309', marginTop:2 }}>{DELIVERY_STATUS_LABELS.DELIVERY_ATTEMPTED}</div>
                      )}
                      {event && (
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                          {event.description}{event.currentLocation ? ` — ${event.currentLocation}` : ''}
                        </div>
                      )}
                      {event?.timestamp && (
                        <div style={{ fontSize:11, color:'var(--text-light)', marginTop:1 }}>
                          {new Date(event.timestamp).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ModificationModal({ order, onClose }) {
  const [newSize, setNewSize] = useState('')
  const [newFrame, setNewFrame] = useState('')
  const [newThickness, setNewThickness] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async () => {
    const body = {}
    if (newSize) body.newSize = newSize
    if (newFrame) body.newFrame = newFrame
    if (newThickness) body.newThickness = newThickness
    if (!Object.keys(body).length) { toast.error('Please select at least one change'); return }
    setSubmitting(true)
    try {
      await api.post(`/orders/${order.id}/modify`, body)
      toast.success('Modification request submitted! Admin will review within 24 hours.')
      onClose()
    } catch { toast.error('Failed to submit modification request') } finally { setSubmitting(false) }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Request Modification — #{order.id}</h3>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#FEF3C7', border:'1px solid #F59E0B', borderRadius:8, padding:12, fontSize:13, color:'#92400E' }}>
            ⚠️ Modification requests are subject to admin approval.
          </div>
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>
            <div><strong>Current:</strong> {SIZE_LABELS[order.productSizeInches]} · {FRAME_LABELS[order.frameTypes]} · {THICKNESS_LABELS[order.productThickness]}</div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>New Size (optional)</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ALL_SIZES.map(s=><button key={s} onClick={()=>setNewSize(newSize===s?'':s)} style={{ padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', background:newSize===s?'#C0392B':'white', color:newSize===s?'white':'#C0392B', borderColor:'#C0392B' }}>{SIZE_LABELS[s]}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>New Frame (optional)</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ALL_FRAMES.map(f=><button key={f} onClick={()=>setNewFrame(newFrame===f?'':f)} style={{ padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', background:newFrame===f?'#C0392B':'white', color:newFrame===f?'white':'#C0392B', borderColor:'#C0392B' }}>{FRAME_LABELS[f]}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>New Thickness (optional)</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ALL_THICKNESSES.map(t=><button key={t} onClick={()=>setNewThickness(newThickness===t?'':t)} style={{ padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', background:newThickness===t?'#C0392B':'white', color:newThickness===t?'white':'#C0392B', borderColor:'#C0392B' }}>{THICKNESS_LABELS[t]}</button>)}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>{submitting?<Spinner size="sm" white />:'Submit Request'}</button>
        </div>
      </div>
    </div>
  )
}

const STATUS_BADGE = {
  PLACED:'badge-amber', CONFIRMED:'badge-blue', MODIFICATION_ALLOWED:'badge-purple',
  PROCESSING:'badge-orange', SHIPPED:'badge-purple', DELIVERED:'badge-green',
}

function buildWhatsAppUrl(order) {
  const size = encodeURIComponent(SIZE_LABELS[order.productSizeInches] || order.productSizeInches || '')
  const frame = encodeURIComponent(FRAME_LABELS[order.frameTypes] || order.frameTypes || '')
  const thickness = encodeURIComponent(THICKNESS_LABELS[order.productThickness] || order.productThickness || '')
  return `https://wa.me/919999999999?text=ORDER_ID:${order.id}%0ASIZE:${size}%0AFRAME:${frame}%0ATHICKNESS:${thickness}`
}

export default function AccountPage() {
  const navigate = useNavigate()
  const clearToken = useStore((s) => s.clearToken)
  const clearCart  = useStore((s) => s.clearCart)

  const [section, setSection]   = useState('profile')
  const [orders, setOrders]     = useState([])
  const [addresses, setAddresses] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError]     = useState(false)
  const [addrLoading, setAddrLoading]     = useState(false)
  const [showAddForm, setShowAddForm]     = useState(false)
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [modifyOrder, setModifyOrder]     = useState(null)

  const phone   = getPhone()
  const name    = getName()
  const initials = name
    ? name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (phone ? phone.slice(-4) : '??')

  useEffect(() => { if (!isLoggedIn()) { navigate('/login?redirect=/account') } }, [navigate])

  const loadOrders = useCallback(() => {
    setOrdersLoading(true)
    setOrdersError(false)
    api.get('/api/user/orders')
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => { setOrders([]); setOrdersError(true) })
      .finally(() => setOrdersLoading(false))
  }, [])

  useEffect(() => {
    if (section === 'orders') loadOrders()
    if (section === 'addresses' && addresses.length === 0) {
      setAddrLoading(true)
      api.get('/api/user/addresses').then(r => setAddresses(r.data || [])).catch(() => {}).finally(() => setAddrLoading(false))
    }
  }, [section, loadOrders, addresses.length])

  const handleLogout = () => { clearToken(); clearCart(); toast.success('Logged out successfully'); navigate('/') }

  return (
    <div className="page-enter">
      <div className="container">
        <div className="account-layout">
          <div className="account-sidebar">
            {[['profile','👤 Profile'],['orders','📦 My Orders'],['addresses','📍 My Addresses']].map(([k,l]) => (
              <button key={k} className={`account-sidebar-link${section===k?' active':''}`} onClick={() => setSection(k)}>{l}</button>
            ))}
            <button className="account-sidebar-link" onClick={handleLogout} style={{ color:'#EF4444' }}>🚪 Logout</button>
          </div>

          <div className="account-main">
            {/* ── PROFILE ── */}
            {section === 'profile' && (
              <div>
                <h2 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:700, marginBottom:24 }}>My Profile</h2>
                <div style={{ display:'flex', alignItems:'center', gap:20, padding:24, background:'var(--off-white)', borderRadius:'var(--radius-md)', border:'1px solid var(--divider)', marginBottom:24 }}>
                  <div className="avatar-lg">{initials}</div>
                  <div>
                    <div style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:700 }}>{name || 'MK Group Printing Member'}</div>
                    <div style={{ color:'var(--text-muted)', fontSize:14, marginTop:4 }}>📞 +91 {phone}</div>
                    <span className="badge badge-red" style={{ marginTop:8 }}>Verified Member</span>
                  </div>
                </div>
                <div style={{ padding:20, background:'var(--off-white)', borderRadius:'var(--radius-md)', border:'1px solid var(--divider)' }}>
                  <h3 style={{ fontFamily:'var(--font-heading)', fontSize:17, marginBottom:12 }}>Account Details</h3>
                  <div style={{ fontSize:14, color:'var(--text-muted)', lineHeight:2 }}>
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
                <h2 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:700, marginBottom:24 }}>My Orders</h2>
                {ordersLoading ? <Spinner center /> : ordersError ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <p style={{ color:'var(--text-muted)' }}>Could not load orders. Please try again.</p>
                    <button className="btn btn-outline" style={{ marginTop:16 }} onClick={loadOrders}>Retry</button>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <div style={{ fontSize:48, marginBottom:12, opacity:0.3 }}>📦</div>
                    <p style={{ color:'var(--text-muted)' }}>No orders yet. Start customising!</p>
                    <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/products')}>Browse Products</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {orders.map((o) => (
                      <div key={o.id} style={{ border:'1px solid var(--divider)', borderRadius:'var(--radius-md)', padding:20, background:'white', boxShadow:'var(--shadow-sm)' }}>
                        <div style={{ display:'flex', gap:16, marginBottom:12 }}>
                          <img
                            src={o.product?.imageUrl || o.customImageUrl || PLACEHOLDER_IMAGE}
                            alt={o.product?.productName || 'Order'}
                            style={{ width:80, height:80, objectFit:'cover', borderRadius:'var(--radius-sm)', border:'1px solid var(--divider)', flexShrink:0 }}
                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                          />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
                              <div>
                                <div style={{ fontWeight:700, fontSize:15 }}>{o.product?.productName || 'Custom Print Order'}</div>
                                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                                  Order #{o.id} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                                </div>
                              </div>
                              <div style={{ fontWeight:800, fontSize:18, color:'var(--primary)' }}>{formatINR(o.finalPrice)}</div>
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:12, fontSize:12, color:'var(--text-muted)', marginTop:10 }}>
                              <span>Size: {SIZE_LABELS[o.productSizeInches] || o.productSizeInches}</span>
                              <span>Thickness: {THICKNESS_LABELS[o.productThickness] || o.productThickness}</span>
                              <span>Frame: {FRAME_LABELS[o.frameTypes] || o.frameTypes}</span>
                              {o.borderColor && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                                  Border:
                                  <span style={{ width:12, height:12, borderRadius:'50%', background:o.borderColor, display:'inline-block', border:'1px solid #eee' }} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                          <span className={`badge ${STATUS_BADGE[o.orderStatus] || ORDER_STATUS_BADGE[o.orderStatus] || 'badge-grey'}`}>{o.orderStatus}</span>
                          <span className={`badge ${PAYMENT_STATUS_BADGE[o.paymentStatus] || 'badge-grey'}`}>{o.paymentStatus}</span>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setTrackingOrder(o)}>📍 Track Order</button>
                          {o.orderStatus === 'MODIFICATION_ALLOWED' && (
                            <button className="btn btn-outline btn-sm" onClick={() => setModifyOrder(o)}>✏️ Request Modification</button>
                          )}
                          {(o.orderStatus === 'CONFIRMED' || o.orderStatus === 'MODIFICATION_ALLOWED') && (
                            <a
                              href={buildWhatsAppUrl(o)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Available during modification window"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 14px',
                                borderRadius: 8,
                                background: '#25D366',
                                color: '#FFFFFF',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Customise via WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESSES ── */}
            {section === 'addresses' && (
              <div>
                <h2 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:700, marginBottom:24 }}>My Addresses</h2>
                {addrLoading ? <Spinner /> : (
                  <>
                    {addresses.map(addr => (
                      <div key={addr.id} className="address-card" style={{ marginBottom:12 }}>
                        <div className="address-card-title">{addr.fullName} · {addr.phoneNo}</div>
                        <div className="address-card-text">{addr.addressLine}{addr.landmark?`, ${addr.landmark}`:''}, {addr.city}, {addr.state} — {addr.pinCode}</div>
                        {addr.isDefault && <span className="badge badge-green" style={{ marginTop:6 }}>Default</span>}
                      </div>
                    ))}
                    {!showAddForm ? (
                      <button className="add-address-btn" onClick={() => setShowAddForm(true)}>+ Add New Address</button>
                    ) : (
                      <div style={{ border:'1.5px solid var(--primary)', borderRadius:'var(--radius-md)', padding:20, marginTop:12 }}>
                        <AddressForm compact onSave={(a) => { setAddresses(p => [...p, a]); setShowAddForm(false) }} onCancel={() => setShowAddForm(false)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {trackingOrder && <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}
      {modifyOrder && <ModificationModal order={modifyOrder} onClose={() => setModifyOrder(null)} />}
    </div>
  )
}
