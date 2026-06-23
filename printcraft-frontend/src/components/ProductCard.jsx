import { memo, useMemo, useCallback, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABELS, formatINR } from '../utils/format'
import { getFrameShapeStyles, SAMPLE_PHOTOS } from '../utils/framePreview'
import CyclingFrame from './CyclingFrame'

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
        // Apply quick-response transition only on enter so JS rotations are smooth
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
      <div className="pc-card-frame-wrapper">
        <CyclingFrame
          photos={SAMPLE_PHOTOS}
          width={shape.width}
          height={shape.height}
          frameStyle={frameStyle}
          boxShadow={shape.boxShadow}
          pauseWhenHidden
        />
      </div>

      <div className="pc-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.productName}
              width={40}
              height={40}
              style={{ borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <h3 className="pc-card-name" style={{ margin: 0 }}>{product.productName}</h3>
        </div>

        <span className="pc-card-category-badge">
          {CATEGORY_LABELS[product.productCatagories] || product.productCatagories}
        </span>

        {product.basePrice ? (
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
