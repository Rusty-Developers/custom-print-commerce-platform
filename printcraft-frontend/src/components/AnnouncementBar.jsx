const MARQUEE_TEXT =
  '🎨 Free Delivery on Orders Above ₹599\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0📐 Custom Sizes Available\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0⭐ 4.8/5 Rating — 10,000+ Happy Customers\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0🔒 Secure Razorpay Payments'

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <div className="announcement-bar-track" aria-hidden="true">
        <span>{MARQUEE_TEXT}</span>
        <span aria-hidden="true">{MARQUEE_TEXT}</span>
      </div>
    </div>
  )
}
