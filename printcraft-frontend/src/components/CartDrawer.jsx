import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useStore from '../store/useStore'
import { formatINR, SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS } from '../utils/format'

export default memo(function CartDrawer() {
  const navigate = useNavigate()
  const { cartOpen, setCartOpen, cart, removeFromCart, updateQty } = useStore(
    useShallow((s) => ({
      cartOpen: s.cartOpen,
      setCartOpen: s.setCartOpen,
      cart: s.cart,
      removeFromCart: s.removeFromCart,
      updateQty: s.updateQty,
    }))
  )

  const { subtotal, delivery, total } = useMemo(() => {
    const sub = cart.reduce((a, i) => a + i.price * i.quantity, 0)
    const del = sub >= 599 ? 0 : 99
    return { subtotal: sub, delivery: del, total: sub + del }
  }, [cart])

  if (!cartOpen) return null

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} />
      <div className="cart-drawer" role="dialog" aria-label="Shopping Cart">
        {/* Header */}
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">🛒 Your Cart ({cart.length})</h2>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>Your cart is empty</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Add some beautiful prints!</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setCartOpen(false); navigate('/products') }}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.uploadedImageDataUrl || item.imageUrl || 'https://placehold.co/60x60/f9f9f9/ccc?text=Print'}
                    alt={item.productName}
                    width={60}
                    height={60}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.target.src = 'https://placehold.co/60x60/f9f9f9/ccc?text=Print' }}
                  />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.productName}</div>
                  <div className="cart-item-meta">
                    {SIZE_LABELS[item.selectedSize]} · {THICKNESS_LABELS[item.selectedThickness]} · {FRAME_LABELS[item.selectedFrame]}
                    {item.borderColor && (
                      <span style={{
                        display: 'inline-block', width: 10, height: 10,
                        borderRadius: '50%', background: item.borderColor,
                        marginLeft: 4, border: '1px solid #eee', verticalAlign: 'middle'
                      }} />
                    )}
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(idx, item.quantity - 1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(idx, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-price">{formatINR(item.price * item.quantity)}</span>
                    <button className="cart-item-remove" onClick={() => removeFromCart(idx)} title="Remove">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span><span>{formatINR(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery</span>
              <span style={{ color: delivery === 0 ? 'var(--green)' : undefined }}>
                {delivery === 0 ? 'FREE 🎉' : formatINR(delivery)}
              </span>
            </div>
            {delivery > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                Add {formatINR(599 - subtotal)} more for free delivery!
              </div>
            )}
            <div className="cart-summary-row" style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)', paddingTop: 8, borderTop: '1px solid var(--divider)' }}>
              <span>Total</span><span>{formatINR(total)}</span>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => { setCartOpen(false); navigate('/checkout') }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
})
