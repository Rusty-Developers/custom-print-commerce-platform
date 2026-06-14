import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'
import { isLoggedIn, getPhone } from '../utils/jwt'
import { formatINR, SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS, ORDER_STATUS_BADGE, PAYMENT_STATUS_BADGE, ALL_SIZES, ALL_THICKNESSES, ALL_FRAMES } from '../utils/format'

const DELIVERY_STEPS = ['CREATED','PACKED','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED']

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ fullName:'', phoneNo:'', addressLine:'', landmark:'', city:'', state:'', pinCode:'' })
  const [loading, setLoading] = useState(false)
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { const res = await api.post('/api/user/addresses', { ...form, pinCode: parseInt(form.pinCode) }); toast.success('Address saved!'); onSave(res.data) }
    catch { toast.error('Failed to save address') } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.fullName} onChange={set('fullName')} required /></div>
        <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phoneNo} onChange={set('phoneNo')} maxLength={10} required /></div>
      </div>
      <div className="form-group"><label className="form-label">Address Line *</label><input className="form-input" value={form.addressLine} onChange={set('addressLine')} required /></div>
      <div className="form-group"><label className="form-label">Landmark</label><input className="form-input" value={form.landmark} onChange={set('landmark')} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={set('city')} required /></div>
        <div className="form-group"><label className="form-label">State *</label><input className="form-input" value={form.state} onChange={set('state')} required /></div>
        <div className="form-group"><label className="form-label">PIN *</label><input className="form-input" value={form.pinCode} onChange={set('pinCode')} maxLength={6} required /></div>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? <Spinner size="sm" white /> : 'Save'}</button>
        {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

function TrackingModal({ order, onClose }) {
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get(`/api/orders/${order.id}/tracking`).then(r => setTracking(r.data)).catch(() => setTracking(null)).finally(() => setLoading(false))
  }, [order.id])
  const currentStepIdx = tracking ? DELIVERY_STEPS.indexOf(tracking.currentStatus) : -1
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Order Tracking — #{order.id}</h3>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? <Spinner center /> : !tracking ? <p style={{ color:'var(--text-muted)' }}>Tracking info not available yet.</p> : (
            <>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', marginBottom:16, padding:'12px 16px', background:'var(--off-white)', borderRadius:8 }}>
                <div><span style={{ fontSize:12, color:'var(--text-muted)' }}>Tracking ID</span><div style={{ fontWeight:700, fontFamily:'monospace', fontSize:15 }}>{tracking.trackingId}</div></div>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => { navigator.clipboard.writeText(tracking.trackingId); toast.success('Copied!') }}>📋 Copy</button>
              </div>
              {tracking.estimatedDeliveryDate && <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>Estimated delivery: <strong>{new Date(tracking.estimatedDeliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'long'})}</strong></div>}
              <div style={{ position:'relative', paddingLeft:28 }}>
                {DELIVERY_STEPS.map((step, i) => {
                  const done = i < currentStepIdx; const current = i === currentStepIdx
                  const event = tracking.eventDTOS?.find(e => e.status === step)
                  return (
                    <div key={step} style={{ marginBottom:20, position:'relative' }}>
                      <div style={{ position:'absolute', left:-28, top:0, width:18, height:18, borderRadius:'50%',
                        background: done||current ? '#C0392B':'#E5E7EB', border:`2px solid ${done||current?'#C0392B':'#D1D5DB'}`,
                        animation: current ? 'pulse 1.5s infinite' : 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {done && <span style={{ color:'white', fontSize:10, lineHeight:1 }}>✓</span>}
                      </div>
                      {i < DELIVERY_STEPS.length-1 && <div style={{ position:'absolute', left:-20, top:18, width:2, height:24, background: done?'#C0392B':'#E5E7EB' }} />}
                      <div style={{ fontWeight:600, fontSize:13, color: done||current?'var(--text-dark)':'var(--text-muted)' }}>{step.replace(/_/g,' ')}</div>
                      {event && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{event.description}{event.currentLocation ? ` — ${event.currentLocation}`:''}</div>}
                      {event?.timestamp && <div style={{ fontSize:11, color:'var(--text-light)', marginTop:1 }}>{new Date(event.timestamp).toLocaleString('en-IN')}</div>}
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
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [modifyOrder, setModifyOrder]     = useState(null)

  const phone   = getPhone()
  const initials = phone ? phone.slice(-4) : '??'

  useEffect(() => { if (!isLoggedIn()) { navigate('/login?redirect=/account') } }, [navigate])

  const loadOrders = useCallback(() => {
    setOrdersLoading(true)
    api.get('/api/user/orders').then(r => setOrders(r.data || [])).catch(() => {}).finally(() => setOrdersLoading(false))
  }, [])

  useEffect(() => {
    if (section === 'orders' && orders.length === 0) loadOrders()
    if (section === 'addresses' && addresses.length === 0) {
      setAddrLoading(true)
      api.get('/api/user/addresses').then(r => setAddresses(r.data || [])).catch(() => {}).finally(() => setAddrLoading(false))
    }
  }, [section])

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
                    <div style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:700 }}>MK Group Printing Member</div>
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
                {ordersLoading ? <Spinner center /> : orders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <div style={{ fontSize:48, marginBottom:12, opacity:0.3 }}>📦</div>
                    <p style={{ color:'var(--text-muted)' }}>No orders yet. Start customising!</p>
                    <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/products')}>Browse Products</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {orders.map(o => (
                      <div key={o.id} style={{ border:'1px solid var(--divider)', borderRadius:'var(--radius-md)', padding:20, background:'white', boxShadow:'var(--shadow-sm)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:15 }}>{o.product?.productName || '—'}</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Order #{o.id} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</div>
                          </div>
                          <div style={{ fontWeight:800, fontSize:18, color:'var(--primary)' }}>{formatINR(o.finalPrice)}</div>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8, fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
                          <span>{SIZE_LABELS[o.productSizeInches]||o.productSizeInches}</span>·
                          <span>{THICKNESS_LABELS[o.productThickness]||o.productThickness}</span>·
                          <span>{FRAME_LABELS[o.frameTypes]||o.frameTypes}</span>
                          {o.borderColor && <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>· <span style={{ width:10,height:10,borderRadius:'50%',background:o.borderColor,display:'inline-block',border:'1px solid #eee' }}/>{o.borderColor}</span>}
                        </div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                          <span className={`badge ${STATUS_BADGE[o.orderStatus]||'badge-grey'}`}>{o.orderStatus}</span>
                          <span className={`badge ${PAYMENT_STATUS_BADGE[o.paymentStatus]||'badge-grey'}`}>{o.paymentStatus}</span>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setTrackingOrder(o)}>📍 Track Order</button>
                          {o.orderStatus === 'MODIFICATION_ALLOWED' && (
                            <button className="btn btn-outline btn-sm" onClick={() => setModifyOrder(o)}>✏️ Request Modification</button>
                          )}
                          {(o.orderStatus === 'CONFIRMED' || o.orderStatus === 'MODIFICATION_ALLOWED') && (
                            <a
                              href={`https://wa.me/919999999999?text=ORDER_ID:${o.id}%0ASIZE:%0AFRAME:%0ATHICKNESS:`}
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
                        <AddressForm onSave={(a) => { setAddresses(p => [...p, a]); setShowAddForm(false) }} onCancel={() => setShowAddForm(false)} />
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
