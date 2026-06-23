const MARQUEE_TEXT =
  'Free Delivery on Orders Above ₹599\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0Custom Sizes Available\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0 4.8/5 Rating — 10,000+ Happy Customers\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0Secure Razorpay Payments'

// Static plain text for screen readers — they skip the aria-hidden animated version
const STATIC_TEXT = 'Free delivery on orders above ₹599. Custom sizes available. 4.8/5 rating with 10,000+ happy customers. Secure Razorpay payments.'

export default function AnnouncementBar() {
  return (
    <div
      className="announcement-bar"
      role="region"
      aria-label="Site announcements"
    >
      {/* Screen-reader-only static text — prevents marquee repetition being read aloud */}
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {STATIC_TEXT}
      </span>

      {/* Animated marquee — hidden from screen readers */}
      <div aria-hidden="true" style={{ overflow: 'hidden' }}>
        <div className="announcement-bar-track">
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
        </div>
      </div>
    </div>
  )
}
