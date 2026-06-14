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

// ── Glassy Frame Preview ──
function GlassyFramePreview({ frameType, size, thickness, borderColor, images, uploadedImage }) {
  const dims = SIZE_PREVIEW_DIMS[size] || { w: 160, h: 240 }
  const border = THICKNESS_BORDER[thickness] || 6
  const [currentImg, setCurrentImg] = useState(0)
  const [prevImg, setPrevImg] = useState(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (uploadedImage || !images || images.length <= 1) return
    const t = setInterval(() => {
      setPrevImg(currentImg)
      setFading(true)
      const next = (currentImg + 1) % images.length
      setTimeout(() => { setCurrentImg(next); setFading(false) }, 600)
    }, 3500)
    return () => clearInterval(t)
  }, [currentImg, images, uploadedImage])

  const src = uploadedImage || (images && images[currentImg]) || 'https://placehold.co/300x400/f0ece8/c8b8a2?text=Your+Photo'
  const prevSrc = images && prevImg !== null ? images[prevImg] : null

  let containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.25), 0 25px 80px rgba(0,0,0,0.15)',
    border: '1.5px solid rgba(255,255,255,0.4)',
  }
  let w = dims.w, h = dims.h

  switch (frameType) {
    case 'PORTRAIT':
      w = Math.round(dims.w * 0.67); h = dims.h
      Object.assign(containerStyle, { borderRadius: 6, width: w, height: h })
      break
    case 'LANDSCAPE':
      w = dims.h; h = Math.round(dims.w * 0.67)
      Object.assign(containerStyle, { borderRadius: 6, width: w, height: h })
      break
    case 'CIRCULAR':
      w = Math.min(dims.w, dims.h); h = w
      Object.assign(containerStyle, { borderRadius: '50%', width: w, height: h })
      break
    case 'FLOATING':
      Object.assign(containerStyle, {
        borderRadius: 6, border: 'none', width: dims.w, height: dims.h,
        boxShadow: '0 20px 80px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.3)',
      })
      break
    case 'POSTER':
      w = dims.w; h = Math.round(dims.h * 1.2)
      Object.assign(containerStyle, { borderRadius: 2, width: w, height: h })
      break
    case 'BORDERED':
      Object.assign(containerStyle, {
        borderRadius: 4, width: dims.w, height: dims.h,
        border: `${border + 6}px solid ${borderColor}`,
        padding: 10, background: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      })
      break
    case 'STADIUM':
      Object.assign(containerStyle, { borderRadius: 999, width: dims.h, height: dims.w })
      break
    default:
      Object.assign(containerStyle, { borderRadius: 6, width: dims.w, height: dims.h })
  }

  const edgeHighlight = {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 11, borderRadius: 'inherit',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), inset 1px 0 0 rgba(255,255,255,0.3), inset -1px 0 0 rgba(0,0,0,0.05)',
  }
  const glossStyle = {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, borderRadius: 'inherit',
    background: 'linear-gradient(135deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0.18) 35%,rgba(255,255,255,0.08) 40%,rgba(255,255,255,0) 45%,rgba(255,255,255,0) 60%,rgba(255,255,255,0.12) 65%,rgba(255,255,255,0.05) 68%,rgba(255,255,255,0) 72%)',
    mixBlendMode: 'overlay',
    animation: 'shimmer 4s ease-in-out infinite',
    backgroundSize: '400% 100%',
  }
  const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0, borderRadius: 'inherit' }

  return (
    <div style={containerStyle}>
      {fading && prevSrc && (
        <img src={prevSrc} alt="" style={{ ...imgStyle, opacity: 0, transition: 'opacity 600ms ease-in-out' }} />
      )}
      <img src={src} alt="Frame preview" style={{ ...imgStyle, opacity: 1, transition: fading ? 'opacity 600ms ease-in-out' : 'none' }}
        onError={(e) => { e.target.src = 'https://placehold.co/300x400/f0ece8/c8b8a2?text=Your+Photo' }} />
      <div style={glossStyle} />
      <div style={edgeHighlight} />
    </div>
  )
}
// ── Upload Zone (with real backend upload) ──
function UploadZone({ onPreview, onUploaded, uploadedUrl, onRemove }) {
  const [drag, setDrag] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | done
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG or PNG image'); return
    }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    // Instant local preview via FileReader
    const reader = new FileReader()
    reader.onload = (e) => onPreview(e.target.result)
    reader.readAsDataURL(file)

    // Real backend upload
    setStatus('uploading')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/api/files/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded(res.data.url)
      setStatus('done')
    } catch {
      toast.error('Upload failed. Please try again.')
      setStatus('idle')
    }
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
      <div className="upload-sub">JPG or PNG, max 5MB — drag &amp; drop or click to browse</div>
      {status === 'uploading' && <div className="upload-success" style={{ color: '#F59E0B' }}>⏳ Uploading...</div>}
      {status === 'done' && uploadedUrl && (
        <div className="upload-success">
          ✅ Photo ready!
          <span style={{ color: 'var(--primary)', cursor: 'pointer', marginLeft: 8, fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); onRemove(); setStatus('idle') }}>
            Remove ✕
          </span>
        </div>
      )}
    </div>
  )
}
// ── Reviews Section (real API) ──
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4, cursor: 'pointer' }}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ fontSize: 28, color: (hovered || value) >= s ? '#C0392B' : '#ddd', transition: 'color 0.15s' }}
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}>★</span>
      ))}
    </div>
  )
}

function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewImg, setReviewImg] = useState('')
  const [reviewImgPreview, setReviewImgPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const loggedIn = isLoggedIn()

  const fetchReviews = useCallback(() => {
    setLoading(true)
    api.get(`/api/reviews/${productId}`)
      .then(r => setReviews(r.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleReviewImage = async (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setReviewImgPreview(e.target.result)
    reader.readAsDataURL(file)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await api.post('/api/files/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setReviewImg(res.data.url)
    } catch { toast.error('Image upload failed') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a star rating'); return }
    setSubmitting(true)
    try {
      await api.post('/api/reviews', { productId: productId.toString(), rating, comment, imageUrl: reviewImg })
      toast.success('Review submitted! ⭐')
      setShowForm(false); setRating(0); setComment(''); setReviewImg(''); setReviewImgPreview('')
      fetchReviews()
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('duplicate') || err.response?.status === 409)
        toast.error("You've already reviewed this product")
      else toast.error('Failed to submit review')
    } finally { setSubmitting(false) }
  }

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700 }}>Customer Reviews</h3>
        {loggedIn && !showForm && (
          <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)} id="write-review-btn">✍️ Write a Review</button>
        )}
      </div>

      {avgRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ display: 'flex', gap: 2, color: '#C0392B', fontSize: 16 }}>{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>{avgRating}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>— {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <div style={{ border: '1.5px solid var(--primary)', borderRadius: 12, padding: 24, marginBottom: 28, background: '#FEF9F9' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, marginBottom: 16 }}>Write Your Review</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Rating *</div>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-input form-textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." />
            </div>
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <input type="file" accept="image/*" onChange={e => handleReviewImage(e.target.files[0])} />
              {reviewImgPreview && <img src={reviewImgPreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid var(--divider)' }} />}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? <Spinner size="sm" white /> : 'Submit Review'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner center /> : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>No reviews yet. Be the first to review!</p>
      ) : (
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div key={r.id || i} className="review-card">
              <div className="review-header">
                <div className="review-avatar">{(r.username || 'U').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="review-name">{r.username || 'Customer'}</div>
                  <div className="review-date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#C0392B', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
              <p className="review-text">"{r.comment}"</p>
              {r.imageUrl && <img src={r.imageUrl} alt="review" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
            </div>
          ))}
        </div>
      )}
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
  const [previewSrc, setPreviewSrc]   = useState(null)   // FileReader data URL (local preview only)
  const [customImageUrl, setCustomImageUrl] = useState('') // real backend URL /uploads/...
  const [activeTab, setActiveTab]     = useState('description')

  const [selectedSize,      setSelectedSize]      = useState('SIZE_8X12')
  const [selectedThickness, setSelectedThickness] = useState('MM_3')
  const [selectedFrame,     setSelectedFrame]     = useState('PORTRAIT')
  const [borderColor,       setBorderColor]       = useState('#C0392B')
  const [quantity,          setQuantity]          = useState(1)

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then((r) => { setProduct(r.data); if (r.data.frameTypes) setSelectedFrame(r.data.frameTypes) })
      .catch(() => { toast.error('Product not found'); navigate('/products') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const fetchPrice = useCallback(() => {
    if (!id) return
    setPriceLoading(true)
    api.get(`/api/products/pricing/${id}`, { params: { productSizeInches: selectedSize, productThickness: selectedThickness } })
      .then((r) => setPrice(r.data.price))
      .catch(() => setPrice(null))
      .finally(() => setPriceLoading(false))
  }, [id, selectedSize, selectedThickness])

  useEffect(() => { if (product) fetchPrice() }, [product, fetchPrice])

  const cartItem = () => ({
    productId: product.id, productName: product.productName, imageUrl: product.imageUrl,
    selectedSize, selectedThickness, selectedFrame, borderColor,
    uploadedImageDataUrl: previewSrc, customImageUrl,
    quantity, price: parseFloat(price),
  })

  const handleAddToCart = () => {
    if (!price) { toast.error('Please wait for pricing to load'); return }
    addToCart(cartItem()); toast.success('Added to cart! 🎉'); setCartOpen(true)
  }

  const handleBuyNow = () => {
    if (!isLoggedIn()) { navigate('/login?redirect=/checkout'); return }
    if (!price) { toast.error('Please wait for pricing to load'); return }
    addToCart(cartItem()); navigate('/checkout')
  }

  if (loading) return <Spinner center />
  if (!product) return null

  const productImages = product.imageUrl ? [product.imageUrl] : []

  return (
    <div className="product-page page-enter">
      <div className="container">
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
            <div className="room-scene">
              <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 3px)', borderRadius: 'inherit', pointerEvents: 'none' }} />
              <div className="frame-preview-area">
                <GlassyFramePreview
                  frameType={selectedFrame} size={selectedSize} thickness={selectedThickness}
                  borderColor={borderColor} images={productImages} uploadedImage={previewSrc}
                />
              </div>
              <div className="scale-ref">
                <svg width="20" height="32" viewBox="0 0 20 32" fill="rgba(70,60,50,0.5)">
                  <ellipse cx="10" cy="5" rx="5" ry="5"/><rect x="6" y="10" width="8" height="14" rx="3"/>
                  <rect x="6" y="24" width="3" height="8" rx="1.5"/><rect x="11" y="24" width="3" height="8" rx="1.5"/>
                </svg>
                <div style={{ width: 60, height: 1, background: 'rgba(70,60,50,0.35)' }} />
                <span>{SIZE_LABELS[selectedSize]} real scale reference</span>
              </div>
            </div>

            {/* Shape switcher */}
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_FRAMES.map(f => (
                <button key={f} onClick={() => setSelectedFrame(f)}
                  style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                    background: selectedFrame === f ? '#C0392B' : 'white',
                    color: selectedFrame === f ? 'white' : '#C0392B',
                    borderColor: '#C0392B' }}>
                  {FRAME_LABELS[f]}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <UploadZone
                onPreview={setPreviewSrc} onUploaded={setCustomImageUrl} uploadedUrl={customImageUrl}
                onRemove={() => { setPreviewSrc(null); setCustomImageUrl('') }}
              />
            </div>
          </div>

          {/* RIGHT — Config Panel */}
          <div className="config-panel">
            <div>
              <span className="badge badge-red" style={{ marginBottom: 10, display: 'inline-flex' }}>{CATEGORY_LABELS[product.productCatagories]}</span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{product.productName}</h1>
              <div className="config-rating">
                <span className="stars" style={{ fontSize: 14 }}>★★★★☆</span>
                <span>4.8/5 — Reviews below</span>
              </div>
            </div>

            <div className="config-section">
              <div className="config-price">
                {priceLoading ? <Spinner size="sm" /> : price ? formatINR(price) : <span style={{ fontSize: 20, color: 'var(--text-muted)' }}>Select size &amp; thickness</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Inclusive of all taxes</div>
            </div>

            <div className="config-section">
              <div className="config-label">Size</div>
              <div className="pill-group">
                {ALL_SIZES.map((s) => (
                  <button key={s} className={`pill${selectedSize === s ? ' active' : ''}`} onClick={() => setSelectedSize(s)}>{SIZE_LABELS[s]}</button>
                ))}
              </div>
            </div>

            <div className="config-section">
              <div className="config-label">Thickness</div>
              <div className="pill-group">
                {ALL_THICKNESSES.map((t) => (
                  <button key={t} className={`pill${selectedThickness === t ? ' active' : ''}`} onClick={() => setSelectedThickness(t)}>{THICKNESS_LABELS[t]}</button>
                ))}
              </div>
            </div>

            <div className="config-section">
              <div className="config-label">Border Color</div>
              <div className="color-picker-row">
                <input type="color" id="border-color-picker" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                <span className="color-hex">{borderColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="config-section">
              <div className="config-label">Quantity</div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-num" style={{ fontSize: 16, fontWeight: 700 }}>{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-outline btn-full" onClick={handleAddToCart} id="add-to-cart-btn">🛒 Add to Cart</button>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleBuyNow} id="buy-now-btn">⚡ Buy Now</button>
            </div>

            <div className="trust-badge">🔒 Secure Checkout — Razorpay Protected &nbsp;|&nbsp; 100% Safe Payment</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="info-tabs">
          <div className="tab-list">
            {[['description','Description'],['details','Details'],['howto','How to Use']].map(([k,l]) => (
              <button key={k} className={`tab-btn${activeTab === k ? ' active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
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
                <li>Choose a frame style using the shape switcher below the preview</li>
                <li>Upload your photo using the drop zone on the left</li>
                <li>Adjust border colour to your taste</li>
                <li>Add to cart and proceed to checkout</li>
                <li>Delivered in 5–7 working days</li>
              </ol>
            )}
          </div>
        </div>

        <ReviewsSection productId={id} />
      </div>
    </div>
  )
}
