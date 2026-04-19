const messages = [
  '🚚 Free Delivery on Orders Above ₹599',
  '✨ Premium Print Quality Guaranteed',
  '📐 Custom Sizes Available',
  '🎨 100% Satisfaction Promise',
  '💳 Secure Razorpay Payments',
  '🇮🇳 Proudly Made in India',
]

export default function AnnouncementBar() {
  const text = messages.join('   •   ')
  return (
    <div className="announcement-bar">
      <div className="announcement-bar-track">
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  )
}
