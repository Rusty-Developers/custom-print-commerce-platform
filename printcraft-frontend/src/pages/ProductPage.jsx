import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useStore from '../store/useStore'
import Spinner from '../components/Spinner'
import { isLoggedIn } from '../utils/jwt'
import {
  formatINR,
  SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS,
  CATEGORY_LABELS,
  ALL_SIZES, ALL_THICKNESSES, ALL_FRAMES,
  SIZE_PREVIEW_DIMS, THICKNESS_BORDER,
} from '../utils/format'

// ── Frame Preview Component ──
function FramePreview({ frameType, size, thickness, borderColor, imageSrc, productImageUrl }) {
  const dims   = SIZE_PREVIEW_DIMS[size]   || { w: 160, h: 240 }
  const border = THICKNESS_BORDER[thickness] || 6

  const frameStyle = {
    width:  dims.w,
    height: dims.h,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }

  switch (frameType) {
    case 'PORTRAIT':
      Object.assign(frameStyle, {
        aspectRatio: '2/3',
        borderRadius: 4,
        border: `${border}px solid #5a3e2b`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: dims.w * 0.67,
        height: dims.h,
      })
      break
    case 'LANDSCAPE':
      Object.assign(frameStyle, {
        borderRadius: 4,
        border: `${border}px solid #5a3e2b`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: dims.h,
        height: dims.w * 0.67,
      })
      break
    case 'CIRCULAR':
      Object.assign(frameStyle, {
        borderRadius: '50%',
        border: `${border}px solid #5a3e2b`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: Math.min(dims.w, dims.h),
        height: Math.min(dims.w, dims.h),
      })
      break
    case 'FLOATING':
      Object.assign(frameStyle, {
        borderRadius: 4,
        border: 'none',
        boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2)',
      })
      break
    case 'POSTER':
      Object.assign(frameStyle, {
        borderRadius: 2,
        border: `${border}px solid #333`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        width: dims.w,
        height: dims.h * 1.2,
      })
      break
    case 'BORDERED':
      Object.assign(frameStyle, {
        borderRadius: 4,
        border: `${border + 6}px solid ${borderColor}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        padding: 8,
        background: 'white',
      })
      break
    default:
      Object.assign(frameStyle, {
        borderRadius: 4,
        border: `${border}px solid #5a3e2b`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      })
  }

  const src = imageSrc || productImageUrl || 'https://placehold.co/300x400/f0ece8/c8b8a2?text=Your+Photo+Here'

  return (
    <div style={frameStyle}>
      <img
        src={src}
        alt="Frame preview"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'all 0.3s ease' }}
        onError={(e) => { e.target.src = 'https://placehold.co/300x400/f0ece8/c8b8a2?text=Your+Photo' }}
      />
    </div>
  )
}

// ── Upload Drop Zone ──
function UploadZone({ onImageUpload, uploadedImage, onRemove }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG or PNG image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => onImageUpload(e.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div
      className={`upload-zone${drag ? ' drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files[0])} />
      <span className="upload-icon">📤</span>
      <div className="upload-title">Upload Your Photo</div>
      <div className="upload-sub">JPG or PNG, max 5MB — drag & drop or click to browse</div>
      {uploadedImage && (
        <div className="upload-success">
          ✅ Photo uploaded!
          <span
            style={{ color: 'var(--primary)', cursor: 'pointer', marginLeft: 8, fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
          >
            Remove ✕
          </span>
        </div>
      )}
    </div>
  )
}

// ── Reviews Section ──
const MOCK_REVIEWS = [
  { name: 'Priya S.', initials: 'PS', rating: 5, text: 'Absolutely stunning quality! The acrylic print looks even better than I imagined. PrintCraft has exceeded my expectations.', date: 'March 2025' },
  { name: 'Rahul M.', initials: 'RM', rating: 5, text: 'Ordered a glass print of our wedding photo. The colors are incredibly vibrant and the frame quality is premium. Highly recommend!', date: 'February 2025' },
  { name: 'Ananya K.', initials: 'AK', rating: 4, text: 'Great experience from ordering to delivery. The photo preview feature made customizing so easy. Will definitely order again.', date: 'January 2025' },
  { name: 'Vikram T.', initials: 'VT', rating: 5, text: 'The metal print I ordered is a showstopper! Everyone who visits asks where I got it. PrintCraft is the real deal.', date: 'April 2025' },
]

function ReviewsSection() {
  return (
    <div style={{ marginTop: 48 }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Customer Reviews</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div className="stars">{'★★★★½'}</div>
        <span style={{ fontWeight: 700, fontSize: 18 }}>4.8</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>— 1,000+ Reviews</span>
      </div>
      <div className="reviews-grid">
        {MOCK_REVIEWS.map((r, i) => (
          <div key={i} className="review-card">
            <div className="review-header">
              <div className="review-avatar">{r.initials}</div>
              <div>
                <div className="review-name">{r.name}</div>
                <div className="review-date">{r.date}</div>
              </div>
              <div className="stars" style={{ marginLeft: 'auto', fontSize: 13 }}>
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
              </div>
            </div>
            <p className="review-text">"{r.text}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Product Page ──
export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToCart = useStore((s) => s.addToCart)
  const setCartOpen = useStore((s) => s.setCartOpen)

  const [product, setProduct]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [price, setPrice]             = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [activeTab, setActiveTab]     = useState('description')

  // Selections
  const [selectedSize,      setSelectedSize]      = useState('SIZE_8X12')
  const [selectedThickness, setSelectedThickness] = useState('MM_3')
  const [selectedFrame,     setSelectedFrame]     = useState('PORTRAIT')
  const [borderColor,       setBorderColor]       = useState('#C0392B')
  const [quantity,          setQuantity]          = useState(1)

  // Load product
  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then((r) => {
        setProduct(r.data)
        if (r.data.frameTypes) setSelectedFrame(r.data.frameTypes)
      })
      .catch(() => { toast.error('Product not found'); navigate('/products') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  // Fetch price on size/thickness change
  const fetchPrice = useCallback(() => {
    if (!id) return
    setPriceLoading(true)
    api.get(`/api/products/pricing/${id}`, {
      params: { productSizeInches: selectedSize, productThickness: selectedThickness },
    })
      .then((r) => setPrice(r.data.price))
      .catch(() => setPrice(null))
      .finally(() => setPriceLoading(false))
  }, [id, selectedSize, selectedThickness])

  useEffect(() => { if (product) fetchPrice() }, [product, fetchPrice])

  const handleAddToCart = () => {
    if (!price) { toast.error('Please wait for pricing to load'); return }
    addToCart({
      productId: product.id,
      productName: product.productName,
      imageUrl: product.imageUrl,
      selectedSize,
      selectedThickness,
      selectedFrame,
      borderColor,
      uploadedImageDataUrl: uploadedImage,
      quantity,
      price: parseFloat(price),
    })
    toast.success('Added to cart! 🎉')
    setCartOpen(true)
  }

  const handleBuyNow = () => {
    if (!isLoggedIn()) { navigate(`/login?redirect=/checkout`); return }
    if (!price) { toast.error('Please wait for pricing to load'); return }
    addToCart({
      productId: product.id,
      productName: product.productName,
      imageUrl: product.imageUrl,
      selectedSize,
      selectedThickness,
      selectedFrame,
      borderColor,
      uploadedImageDataUrl: uploadedImage,
      quantity,
      price: parseFloat(price),
    })
    navigate('/checkout')
  }

  if (loading) return <Spinner center />
  if (!product) return null

  return (
    <div className="product-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, display: 'flex', gap: 6 }}>
          <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/products')}>Products</span>
          <span>/</span>
          <span>{product.productName}</span>
        </div>

        <div className="product-layout">
          {/* LEFT — Interactive Preview */}
          <div>
            {/* Room Scene */}
            <div className="room-scene">
              {/* Wall texture overlay */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 3px)',
                borderRadius: 'inherit', pointerEvents: 'none',
              }} />

              <div className="frame-preview-area">
                <FramePreview
                  frameType={selectedFrame}
                  size={selectedSize}
                  thickness={selectedThickness}
                  borderColor={borderColor}
                  imageSrc={uploadedImage}
                  productImageUrl={product.imageUrl}
                />
              </div>

              {/* Scale reference */}
              <div className="scale-ref">
                <svg width="20" height="32" viewBox="0 0 20 32" fill="rgba(70,60,50,0.5)">
                  <ellipse cx="10" cy="5" rx="5" ry="5"/>
                  <rect x="6" y="10" width="8" height="14" rx="3"/>
                  <rect x="6" y="24" width="3" height="8" rx="1.5"/>
                  <rect x="11" y="24" width="3" height="8" rx="1.5"/>
                </svg>
                <div style={{ width: 60, height: 1, background: 'rgba(70,60,50,0.35)' }} />
                <span>{SIZE_LABELS[selectedSize]} real scale reference</span>
              </div>
            </div>

            {/* Upload Zone */}
            <div style={{ marginTop: 20 }}>
              <UploadZone
                onImageUpload={setUploadedImage}
                uploadedImage={uploadedImage}
                onRemove={() => setUploadedImage(null)}
              />
            </div>
          </div>

          {/* RIGHT — Config Panel */}
          <div className="config-panel">
            <div>
              <span className="badge badge-red" style={{ marginBottom: 10, display: 'inline-flex' }}>
                {CATEGORY_LABELS[product.productCatagories]}
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
                {product.productName}
              </h1>
              <div className="config-rating">
                <span className="stars" style={{ fontSize: 14 }}>★★★★☆</span>
                <span>4.8/5 — 1,000+ Reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="config-section">
              <div className="config-price">
                {priceLoading ? <Spinner size="sm" /> : price ? formatINR(price) : <span style={{ fontSize: 20, color: 'var(--text-muted)' }}>Select size & thickness</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Inclusive of all taxes</div>
            </div>

            {/* Size */}
            <div className="config-section">
              <div className="config-label">Size</div>
              <div className="pill-group">
                {ALL_SIZES.map((s) => (
                  <button key={s} className={`pill${selectedSize === s ? ' active' : ''}`} onClick={() => setSelectedSize(s)}>
                    {SIZE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Thickness */}
            <div className="config-section">
              <div className="config-label">Thickness</div>
              <div className="pill-group">
                {ALL_THICKNESSES.map((t) => (
                  <button key={t} className={`pill${selectedThickness === t ? ' active' : ''}`} onClick={() => setSelectedThickness(t)}>
                    {THICKNESS_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Type */}
            <div className="config-section">
              <div className="config-label">Frame Type</div>
              <div className="pill-group">
                {ALL_FRAMES.map((f) => (
                  <button key={f} className={`pill${selectedFrame === f ? ' active' : ''}`} onClick={() => setSelectedFrame(f)}>
                    {FRAME_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Color */}
            <div className="config-section">
              <div className="config-label">Border Color</div>
              <div className="color-picker-row">
                <input type="color" id="border-color-picker" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                <span className="color-hex">{borderColor.toUpperCase()}</span>
              </div>
            </div>

            {/* Quantity */}
            <div className="config-section">
              <div className="config-label">Quantity</div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-num" style={{ fontSize: 16, fontWeight: 700 }}>{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-outline btn-full" onClick={handleAddToCart} id="add-to-cart-btn">
                🛒 Add to Cart
              </button>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleBuyNow} id="buy-now-btn">
                ⚡ Buy Now
              </button>
            </div>

            {/* Trust Badge */}
            <div className="trust-badge">
              🔒 Secure Checkout — Razorpay Protected &nbsp;|&nbsp; 100% Safe Payment
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="info-tabs">
          <div className="tab-list">
            {[['description','Description'],['details','Details'],['howto','How to Use']].map(([k,l]) => (
              <button key={k} className={`tab-btn${activeTab === k ? ' active' : ''}`} onClick={() => setActiveTab(k)}>
                {l}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === 'description' && <p>{product.description || 'A premium custom print product crafted to the highest standards of quality.'}</p>}
            {activeTab === 'details' && (
              <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
                <li>Frame Type: {FRAME_LABELS[product.frameTypes]}</li>
                <li>Category: {CATEGORY_LABELS[product.productCatagories]}</li>
                <li>Thickness Options: 3mm, 5mm, 8mm</li>
                <li>Available Sizes: 8×12" to 36×48"</li>
                <li>UV-resistant, fade-proof inks</li>
                <li>Ready to hang — mounting hardware included</li>
              </ul>
            )}
            {activeTab === 'howto' && (
              <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
                <li>Select your preferred size and thickness</li>
                <li>Choose a frame style that suits your wall</li>
                <li>Upload your photo using the drop zone on the left</li>
                <li>Adjust border colour to your taste</li>
                <li>Add to cart and proceed to checkout</li>
                <li>Delivered in 5–7 working days</li>
              </ol>
            )}
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection />
      </div>
    </div>
  )
}
