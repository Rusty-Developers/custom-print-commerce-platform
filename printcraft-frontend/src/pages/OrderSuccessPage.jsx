import { useNavigate, useLocation } from 'react-router-dom'

const WA_BTN_STYLE = {
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
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const orderId = location.state?.orderId || localStorage.getItem('last_order_id')
  const waUrl = `https://wa.me/919999999999?text=ORDER_ID:${orderId || ''}%0ASIZE:%0AFRAME:%0ATHICKNESS:`

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ fontSize: 80, marginBottom: 20, lineHeight: 1 }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 42, fontWeight: 800, color: 'var(--primary)', marginBottom: 16, lineHeight: 1.15 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 10 }}>
          Your custom print is being crafted with care.
        </p>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 0 }}>
          A confirmation email has been sent to your registered email address.
        </p>

        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: '0 0 8px' }}>
            Want to Customise?
          </h2>
          <p style={{ fontSize: 14, color: '#666666', lineHeight: 1.6, margin: '0 0 16px' }}>
            Once your order is confirmed, you can request size or frame changes via WhatsApp within the modification window.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={WA_BTN_STYLE}
          >
            <WhatsAppIcon />
            Request Customisation via WhatsApp
          </a>
          <p style={{ fontSize: 12, color: '#999999', marginTop: 12, lineHeight: 1.5 }}>
            Fill in SIZE, FRAME and THICKNESS before sending. Available after admin confirms your order.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/account')} id="track-order-btn">
            📍 Track My Order
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/products')} id="continue-shopping-btn">
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
