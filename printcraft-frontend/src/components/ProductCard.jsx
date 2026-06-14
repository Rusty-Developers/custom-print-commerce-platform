import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABELS, formatINR } from '../utils/format'

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=500&fit=crop',
]

/**
 * Derives the frame shape styles from frameTypes enum + productName keywords
 */
function getFrameShapeStyles(frameType, productName) {
  const name = (productName || '').toLowerCase()

  // Product-name–based overrides take priority
  if (name.includes('bean')) {
    return {
      clipPath: "path('M 50,0 C 80,0 100,20 100,50 C 100,85 75,100 50,95 C 20,100 0,80 0,50 C 0,15 20,0 50,0')",
      borderRadius: undefined,
      border: undefined,
      aspectRatio: '4 / 5',
    }
  }
  if (name.includes('egg')) {
    return {
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      border: undefined,
      aspectRatio: '4 / 5',
    }
  }
  if (name.includes('extra rounded')) {
    return {
      borderRadius: '40px',
      border: undefined,
      aspectRatio: '4 / 5',
    }
  }

  // Frame-type–based styles
  switch (frameType) {
    case 'PORTRAIT':
      return { borderRadius: '8px', aspectRatio: '3 / 4' }
    case 'LANDSCAPE':
      return { borderRadius: '8px', aspectRatio: '4 / 3' }
    case 'CIRCULAR':
      return { borderRadius: '50%', aspectRatio: '1 / 1' }
    case 'FLOATING':
      return {
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)',
        aspectRatio: '4 / 5',
      }
    case 'BORDERED':
      return {
        borderRadius: '8px',
        border: '6px solid #C0392B',
        aspectRatio: '4 / 5',
      }
    case 'POSTER':
      return {
        borderRadius: '4px',
        border: '2px solid #1A1A1A',
        aspectRatio: '2 / 3',
      }
    default:
      return { borderRadius: '8px', aspectRatio: '4 / 5' }
  }
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()

  // Random starting index so all cards show different images
  const startIndexRef = useRef(Math.floor(Math.random() * SAMPLE_IMAGES.length))
  const [currentIndex, setCurrentIndex] = useState(startIndexRef.current)
  const [prevIndex, setPrevIndex] = useState(null)
  const [isFading, setIsFading] = useState(false)
  const hasPhoto = !!product.imageUrl

  // Auto-cycle photos every 3500ms
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true)
      setPrevIndex((prev) => currentIndex)

      setTimeout(() => {
        setCurrentIndex((idx) => (idx + 1) % SAMPLE_IMAGES.length)
        setIsFading(false)
      }, 600)
    }, 3500)

    return () => clearInterval(timer)
  }, [currentIndex])

  const shapeStyles = getFrameShapeStyles(product.frameTypes, product.productName)

  const frameContainerStyle = {
    position: 'relative',
    width: '100%',
    aspectRatio: shapeStyles.aspectRatio || '4 / 5',
    overflow: 'hidden',
    borderRadius: shapeStyles.borderRadius || '8px',
    border: shapeStyles.border || undefined,
    boxShadow: shapeStyles.boxShadow || '0 4px 16px rgba(0,0,0,0.12)',
    clipPath: shapeStyles.clipPath || undefined,
    background: hasPhoto ? 'transparent' : '#F0F0F0',
  }

  const glassOverlayStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10,
    borderRadius: 'inherit',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 34%, rgba(255,255,255,0.10) 38%, rgba(255,255,255,0) 44%)',
    mixBlendMode: 'overlay',
  }

  const imgBaseStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    borderRadius: 'inherit',
  }

  return (
    <div className="pc-product-card" id={`product-card-${product.id}`}>
      {/* Frame Preview */}
      <div className="pc-card-frame-wrapper">
        <div style={frameContainerStyle}>
          {/* Previous image (fading out) */}
          {isFading && prevIndex !== null && (
            <img
              src={SAMPLE_IMAGES[prevIndex]}
              alt=""
              style={{
                ...imgBaseStyle,
                zIndex: 2,
                opacity: 0,
                transition: 'opacity 600ms ease-in-out',
              }}
            />
          )}

          {/* Current image */}
          <img
            src={SAMPLE_IMAGES[currentIndex]}
            alt={product.productName}
            style={{
              ...imgBaseStyle,
              zIndex: 1,
              opacity: 1,
              transition: 'opacity 600ms ease-in-out',
            }}
          />

          {/* "Upload Your Photo" placeholder overlay */}
          {!hasPhoto && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: 'rgba(240,240,240,0.65)',
                backdropFilter: 'blur(2px)',
                borderRadius: 'inherit',
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 6, opacity: 0.5 }}>📤</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#6B6B6B',
                  letterSpacing: '0.02em',
                }}
              >
                Upload Your Photo
              </span>
            </div>
          )}

          {/* Glass overlay — FIXED, never moves */}
          <div style={glassOverlayStyle} />
        </div>
      </div>

      {/* Product Info */}
      <div className="pc-card-body">
        <h3 className="pc-card-name">{product.productName}</h3>

        <span className="pc-card-category-badge">
          {CATEGORY_LABELS[product.productCatagories] || product.productCatagories}
        </span>

        {product.basePrice ? (
          <div className="pc-card-price">From {formatINR(product.basePrice)}</div>
        ) : (
          <div className="pc-card-price pc-card-price--muted">From ₹—</div>
        )}

        <button
          className="pc-card-cta"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/products/${product.id}`)
          }}
          id={`customise-btn-${product.id}`}
        >
          CUSTOMISE
        </button>
      </div>
    </div>
  )
}
