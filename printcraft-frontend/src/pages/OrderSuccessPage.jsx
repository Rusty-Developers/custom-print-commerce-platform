import { useNavigate, useLocation } from 'react-router-dom'

/* ─── Inline Styles ─────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

  @keyframes checkScale {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.12) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes checkDraw {
    0%   { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35); }
    70%  { box-shadow: 0 0 0 18px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }

  .os-page {
    min-height: 100vh;
    background: #F5F5F5;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 16px 64px;
  }

  .os-wrapper {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .os-card {
    background: #FFFFFF;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    overflow: hidden;
  }

  .os-card-body {
    padding: 32px 28px;
  }

  /* ── Section 1: Success ── */
  .os-check-ring {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #DCFCE7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    animation: checkScale 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both,
               pulseRing 2s ease-out 0.6s infinite;
  }

  .os-check-svg {
    width: 44px;
    height: 44px;
  }

  .os-check-svg circle {
    fill: #22C55E;
  }

  .os-check-svg polyline {
    fill: none;
    stroke: #FFFFFF;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: checkDraw 0.45s ease 0.55s forwards;
  }

  .os-heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 32px;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 8px;
    text-align: center;
    animation: fadeSlideUp 0.5s ease 0.3s both;
  }

  .os-subtext {
    font-size: 15px;
    color: #555;
    margin: 0 0 12px;
    text-align: center;
    animation: fadeSlideUp 0.5s ease 0.4s both;
  }

  .os-order-id {
    display: inline-block;
    background: #F3F4F6;
    color: #6B7280;
    font-size: 13px;
    font-weight: 500;
    padding: 5px 14px;
    border-radius: 999px;
    animation: fadeSlideUp 0.5s ease 0.5s both;
  }

  /* ── Section 2: Timeline ── */
  .os-timeline {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .os-timeline-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    position: relative;
    padding-bottom: 20px;
  }

  .os-timeline-step:last-child {
    padding-bottom: 0;
  }

  .os-timeline-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .os-timeline-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    z-index: 1;
  }

  .os-timeline-dot.done {
    background: #22C55E;
    color: #fff;
  }

  .os-timeline-dot.pending {
    background: #E5E7EB;
    color: #9CA3AF;
    border: 2px solid #D1D5DB;
  }

  .os-timeline-line {
    width: 2px;
    flex: 1;
    background: #E5E7EB;
    min-height: 24px;
    margin: 3px 0;
  }

  .os-timeline-line.done {
    background: #22C55E;
  }

  .os-step-label {
    font-size: 14px;
    font-weight: 600;
    color: #1A1A1A;
    padding-top: 4px;
  }

  .os-step-label.pending {
    color: #9CA3AF;
    font-weight: 500;
  }

  .os-step-note {
    font-size: 12px;
    color: #6B7280;
    margin-top: 4px;
  }

  .os-email-note {
    font-size: 12px;
    color: #9CA3AF;
    margin-top: 16px;
    text-align: center;
    font-style: italic;
  }

  /* ── Section 3: Buttons ── */
  .os-btn-primary {
    display: block;
    width: 100%;
    padding: 14px;
    background: #C0392B;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease;
    text-align: center;
    letter-spacing: 0.02em;
  }

  .os-btn-primary:hover {
    background: #A93226;
    transform: translateY(-1px);
  }

  .os-btn-outline {
    display: block;
    width: 100%;
    padding: 13px;
    background: transparent;
    color: #C0392B;
    border: 2px solid #C0392B;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease;
    text-align: center;
    letter-spacing: 0.02em;
  }

  .os-btn-outline:hover {
    background: #FEF2F2;
    transform: translateY(-1px);
  }

  /* ── WhatsApp Card ── */
  .os-wa-card {
    background: #FFFFFF;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    padding: 24px 28px;
    border-left: 4px solid #25D366;
  }

  .os-wa-title {
    font-size: 15px;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 6px;
  }

  .os-wa-text {
    font-size: 13px;
    color: #6B7280;
    margin: 0 0 16px;
    line-height: 1.6;
  }

  .os-wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    background: #25D366;
    color: #fff;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s ease, transform 0.15s ease;
  }

  .os-wa-btn:hover {
    background: #1EBE5D;
    transform: translateY(-1px);
  }

  .os-wa-hint {
    font-size: 11px;
    color: #9CA3AF;
    margin-top: 10px;
    line-height: 1.5;
  }

  /* ── Trust Section ── */
  .os-trust {
    background: #FFFFFF;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    padding: 20px 28px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .os-trust-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #555;
  }

  .os-trust-icon {
    font-size: 16px;
    flex-shrink: 0;
  }
`

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const STEPS = [
  { label: 'Order Confirmed', done: true },
  { label: 'Production Started', done: false },
  { label: 'Shipped', done: false },
  { label: 'Delivered', done: false },
]

export default function OrderSuccessPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const orderId   = location.state?.orderId || localStorage.getItem('last_order_id')
  const waUrl     = `https://wa.me/919999999999?text=ORDER_ID:${orderId || ''}%0ASIZE:%0AFRAME:%0ATHICKNESS:`

  return (
    <>
      <style>{styles}</style>
      <div className="os-page">
        <div className="os-wrapper">

          {/* ── Section 1: Success indicator ── */}
          <div className="os-card">
            <div className="os-card-body" style={{ textAlign: 'center' }}>
              <div className="os-check-ring">
                <svg className="os-check-svg" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="26" />
                  <polyline points="14,26 22,34 38,18" />
                </svg>
              </div>

              <h1 className="os-heading">Order Confirmed!</h1>
              <p className="os-subtext">Your custom print is being crafted with love.</p>
              {orderId && (
                <span className="os-order-id">Order #{orderId}</span>
              )}
            </div>
          </div>

          {/* ── Section 2: Timeline ── */}
          <div className="os-card">
            <div className="os-card-body">
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: '0 0 20px' }}>
                What happens next?
              </p>
              <div className="os-timeline">
                {STEPS.map((step, i) => (
                  <div key={i} className="os-timeline-step">
                    <div className="os-timeline-left">
                      <div className={`os-timeline-dot ${step.done ? 'done' : 'pending'}`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`os-timeline-line ${step.done ? 'done' : ''}`} />
                      )}
                    </div>
                    <div>
                      <div className={`os-step-label ${step.done ? '' : 'pending'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="os-email-note">
                📧 You'll receive email updates at each step
              </p>
            </div>
          </div>

          {/* ── Section 3: Action buttons ── */}
          <div className="os-card">
            <div className="os-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="os-btn-primary" onClick={() => navigate('/account')} id="track-order-btn">
                📍 Track My Order
              </button>
              <button className="os-btn-outline" onClick={() => navigate('/products')} id="continue-shopping-btn">
                🛍️ Continue Shopping
              </button>
            </div>
          </div>

          {/* ── WhatsApp customisation card ── */}
          <div className="os-wa-card">
            <p className="os-wa-title">Want to customise before production?</p>
            <p className="os-wa-text">
              You can request size or frame changes after admin confirms your order.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="os-wa-btn"
              id="wa-customise-btn"
            >
              <WhatsAppIcon />
              Request Customisation via WhatsApp
            </a>
            <p className="os-wa-hint">
              Fill in SIZE, FRAME and THICKNESS before sending.
            </p>
          </div>

          {/* ── Section 4: Trust ── */}
          <div className="os-trust">
            <div className="os-trust-row">
              <span className="os-trust-icon">📧</span>
              <span>A confirmation email has been sent to your registered email address.</span>
            </div>
            <div className="os-trust-row">
              <span className="os-trust-icon">📞</span>
              <span>For queries: <strong>mkgroupprinting@gmail.com</strong></span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
