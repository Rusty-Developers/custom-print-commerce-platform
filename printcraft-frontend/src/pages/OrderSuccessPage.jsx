import { useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 24px' }}>
      <div style={{ textAlign:'center', maxWidth:520 }}>
        <div style={{ fontSize:80, marginBottom:20, lineHeight:1 }}>🎉</div>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:42, fontWeight:800, color:'var(--primary)', marginBottom:16, lineHeight:1.15 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontSize:18, color:'var(--text-muted)', marginBottom:10 }}>
          Your custom print is being crafted with care.
        </p>
        <p style={{ fontSize:15, color:'var(--text-muted)', marginBottom:36 }}>
          A confirmation email has been sent to your registered email address.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
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
