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
      onKeyDown={(e) => e.key === 'Enter' && goToProduct()}
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
