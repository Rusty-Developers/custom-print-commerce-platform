import { memo, useMemo, useCallback, forwardRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABELS, formatINR } from '../utils/format'
import { getFrameShapeStyles } from '../utils/framePreview'
import { GLASS_OVERLAY, EDGE_HIGHLIGHT } from '../utils/framePreview'

/* ─── Fallback placeholder when no image / image fails to load ─────────────── */
const FALLBACK_BG = '#f0ece8'
const FALLBACK_COLOR = '#c8b8a2'

/* ─── Static Product Image Frame ──────────────────────────────────────────── */
/**
 * Renders the admin-uploaded product image inside the correct frame shape.
 * No cycling, no random photos — only what the admin uploaded.
 */
const StaticProductFrame = memo(function StaticProductFrame({
  imageUrl,
  productName,
  width,
  height,
  frameStyle,
  boxShadow,
}) {
  const [imgError, setImgError] = useState(false)

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    width,
    height,
    backgroundColor: FALLBACK_BG,
    ...frameStyle,
    boxShadow: frameStyle.boxShadow ?? boxShadow,
    flexShrink: 0,
  }

  return (
    <div style={containerStyle}>
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={productName}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Graceful placeholder when no image is set or fails */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: FALLBACK_COLOR,
            fontSize: 11,
            fontWeight: 600,
            textAlign: 'center',
            padding: 8,
            gap: 6,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={FALLBACK_COLOR} strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          No image
        </div>
      )}

      {/* Glass sheen + edge highlight — always on top for premium look */}
      <div style={{ ...GLASS_OVERLAY, zIndex: 10 }} />
      <div style={{ ...EDGE_HIGHLIGHT, zIndex: 11 }} />
    </div>
  )
})

/* ─── Product Card ─────────────────────────────────────────────────────────── */
const ProductCard = memo(forwardRef(function ProductCard({ product, className = '', style = {} }, ref) {
  const navigate = useNavigate()

  const shape = useMemo(
    () => getFrameShapeStyles(product.frameTypes, product.productName),
    [product.frameTypes, product.productName]
  )

  const frameStyle = useMemo(
    () => ({
      borderRadius: shape.borderRadius,
      border: shape.border,
      boxShadow: shape.boxShadow,
      clipPath: shape.clipPath,
    }),
    [shape]
  )

  const goToProduct = useCallback(() => {
    navigate(`/products/${product.id}`)
  }, [navigate, product.id])

  const onCtaClick = useCallback(
    (e) => {
      e.stopPropagation()
      navigate(`/products/${product.id}`)
    },
    [navigate, product.id]
  )

  return (
    <div
      ref={ref}
      className={`pc-product-card${className ? ` ${className}` : ''}`}
      style={style}
      id={`product-card-${product.id}`}
      onClick={goToProduct}
      role="button"
      tabIndex={0}
      aria-label={`${product.productName} — customise this product`}
      onKeyDown={(e) => e.key === 'Enter' && goToProduct()}
      onMouseEnter={(e) => {
        e.currentTarget.style.transition = 'transform 0.08s ease-out'
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left)  / rect.width  - 0.5) * 10
        const y = ((e.clientY - rect.top)   / rect.height - 0.5) * -10
        e.currentTarget.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)'
        e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
    >
      {/* ── Admin-uploaded product image displayed in the frame shape ── */}
      <div className="pc-card-frame-wrapper">
        <StaticProductFrame
          imageUrl={product.imageUrl}
          productName={product.productName}
          width={shape.width}
          height={shape.height}
          frameStyle={frameStyle}
          boxShadow={shape.boxShadow}
        />
      </div>

      <div className="pc-card-body">
        <h3 className="pc-card-name">{product.productName}</h3>

        <span className="pc-card-category-badge">
          {CATEGORY_LABELS[product.productCatagories] || product.productCatagories}
        </span>

        {product.basePrice != null ? (
          <div className="pc-card-price">From {formatINR(product.basePrice)}</div>
        ) : (
          <div className="pc-card-price pc-card-price--muted">From ₹—</div>
        )}

        <button
          type="button"
          className="pc-card-cta"
          onClick={onCtaClick}
          id={`customise-btn-${product.id}`}
        >
          CUSTOMISE
        </button>
      </div>
    </div>
  )
}))

export default ProductCard
