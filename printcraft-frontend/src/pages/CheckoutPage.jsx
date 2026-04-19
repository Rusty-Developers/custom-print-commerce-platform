import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'
import { isLoggedIn, getPhone } from '../utils/jwt'
import { formatINR, SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS } from '../utils/format'

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ fullName: '', phoneNo: '', addressLine: '', landmark: '', city: '', state: '', pinCode: '' })
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.phoneNo || !form.addressLine || !form.city || !form.state || !form.pinCode) {
      toast.error('Please fill all required fields')
      return
    }
    if (!/^[0-9]{6}$/.test(form.pinCode)) { toast.error('PIN code must be 6 digits'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/user/addresses', { ...form, pinCode: parseInt(form.pinCode) })
      toast.success('Address saved!')
      onSave(res.data)
    } catch { toast.error('Failed to save address') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="Full Name" value={form.fullName} onChange={set('fullName')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input className="form-input" placeholder="10-digit mobile" value={form.phoneNo} onChange={set('phoneNo')} maxLength={10} required />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address Line *</label>
        <input className="form-input" placeholder="House no., Street, Area" value={form.addressLine} onChange={set('addressLine')} required />
      </div>
      <div className="form-group">
        <label className="form-label">Landmark <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(optional)</span></label>
        <input className="form-input" placeholder="Near landmark" value={form.landmark} onChange={set('landmark')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">City *</label>
          <input className="form-input" placeholder="City" value={form.city} onChange={set('city')} required />
        </div>
        <div className="form-group">
          <label className="form-label">State *</label>
          <input className="form-input" placeholder="State" value={form.state} onChange={set('state')} required />
        </div>
        <div className="form-group">
          <label className="form-label">PIN Code *</label>
          <input className="form-input" placeholder="6 digits" value={form.pinCode} onChange={set('pinCode')} maxLength={6} required />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Spinner size="sm" white /> : 'Save Address'}
        </button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const cart     = useStore((s) => s.cart)
  const clearCart = useStore((s) => s.clearCart)

  const [addresses, setAddresses]       = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddForm, setShowAddForm]   = useState(false)
  const [placing, setPlacing]           = useState(false)
  const [success, setSuccess]           = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [loadingAddr, setLoadingAddr]   = useState(true)

  // Guard
  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login?redirect=/checkout'); return }
    if (cart.length === 0) { navigate('/products'); return }
    api.get('/api/user/addresses')
      .then((r) => { setAddresses(r.data); if (r.data.length > 0) setSelectedAddressId(r.data[0].id) })
      .catch(() => {})
      .finally(() => setLoadingAddr(false))
  }, [navigate, cart])

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0)
  const delivery = subtotal >= 599 ? 0 : 99
  const total    = subtotal + delivery

  const handleAddressSaved = (addr) => {
    setAddresses((p) => [...p, addr])
    setSelectedAddressId(addr.id)
    setShowAddForm(false)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return }
    const item = cart[0]
    setPlacing(true)
    try {
      // 1. Create order
      const orderRes = await api.post('/api/orders', {
        productId: item.productId,
        sizeInches: item.selectedSize,
        thicknessMm: item.selectedThickness,
        frameType: item.selectedFrame,
        borderColor: item.borderColor || '#C0392B',
        customImageUrl: item.uploadedImageDataUrl || '',
        addressId: selectedAddressId,
      })
      const orderId = orderRes.data.id

      // 2. Create Razorpay order
      const payRes = await api.post(`/create-order/${orderId}`)
      const { razorpayOrderId, razorpayPublicKey, amount, currency } = payRes.data

      // 3. Open Razorpay modal
      const options = {
        key: razorpayPublicKey,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'PrintCraft',
        description: `Order for ${item.productName}`,
        theme: { color: '#C0392B' },
        handler: () => {
          clearCart()
          setSuccessOrder({ orderId, productName: item.productName, total })
          setSuccess(true)
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment failed or cancelled. Please try again.')
            setPlacing(false)
          },
        },
      }

      if (!window.Razorpay) {
        toast.error('Razorpay not loaded. Please refresh and try again.')
        setPlacing(false)
        return
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  // Success screen
  if (success && successOrder) {
    return (
      <div className="success-page page-enter">
        <div className="success-icon">🎉</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 8 }}>
          Order #{successOrder.orderId} — {successOrder.productName}
        </p>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>
          You'll receive a confirmation shortly. Estimated delivery in 5–7 working days.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/account')}>View My Orders</button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="container">
        <div className="checkout-layout">
          {/* LEFT — Delivery */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>Checkout</h1>

            <h2 className="checkout-section-title">Delivery Address</h2>
            {loadingAddr ? <Spinner /> : (
              <>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card${selectedAddressId === addr.id ? ' selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                    id={`address-${addr.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedAddressId === addr.id ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: selectedAddressId === addr.id ? 'var(--primary)' : 'white',
                        flexShrink: 0, marginTop: 2,
                      }} />
                      <div>
                        <div className="address-card-title">{addr.fullName} · {addr.phoneNo}</div>
                        <div className="address-card-text">
                          {addr.addressLine}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} — {addr.pinCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!showAddForm ? (
                  <button className="add-address-btn" onClick={() => setShowAddForm(true)} id="add-address-btn">
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '0 16px 16px' }}>
                    <AddressForm onSave={handleAddressSaved} onCancel={() => setShowAddForm(false)} />
                  </div>
                )}
              </>
            )}

            {/* Notice */}
            <div className="notice-box" style={{ marginTop: 24 }}>
              ⚠️ <strong>Important:</strong> Orders cannot be cancelled once confirmed. Returns are not accepted after delivery.
              Prepaid payment only — no Cash on Delivery.
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div>
            <div className="order-summary-card">
              <div className="order-summary-header">Order Summary</div>
              <div className="order-summary-body">
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--divider)' }}>
                    <img
                      src={item.uploadedImageDataUrl || item.imageUrl || 'https://placehold.co/60x60'}
                      alt={item.productName}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--divider)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {SIZE_LABELS[item.selectedSize]} · {THICKNESS_LABELS[item.selectedThickness]} · {FRAME_LABELS[item.selectedFrame]}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                        {formatINR(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="price-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="price-row">
                  <span>Delivery</span>
                  <span style={{ color: delivery === 0 ? 'var(--green)' : undefined }}>
                    {delivery === 0 ? 'FREE' : formatINR(delivery)}
                  </span>
                </div>
                <div className="price-row">
                  <span>Discount</span><span>₹0.00</span>
                </div>
                <div className="price-row total">
                  <span>Total</span><span>{formatINR(total)}</span>
                </div>

                {/* Payment icons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', paddingTop: 4 }}>
                  {['💳 UPI', '🏦 NetBanking', '💳 Credit Card', '💳 Debit Card'].map((m) => (
                    <span key={m} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0 20px 20px' }}>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddressId}
                  id="place-order-btn"
                >
                  {placing ? <><Spinner size="sm" white /> Processing...</> : `🔒 Place Order & Pay ${formatINR(total)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
