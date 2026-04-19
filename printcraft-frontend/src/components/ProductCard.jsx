import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABELS } from '../utils/format'

export default function ProductCard({ product }) {
  const navigate = useNavigate()

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card-image">
        <img
          src={product.imageUrl || 'https://placehold.co/300x300/f9f9f9/ccc?text=PrintCraft'}
          alt={product.productName}
          onError={(e) => { e.target.src = 'https://placehold.co/300x300/f9f9f9/ccc?text=PrintCraft' }}
          loading="lazy"
        />
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.productName}</h3>
        <div className="product-card-badges">
          <span className="badge badge-red">{CATEGORY_LABELS[product.productCatagories] || product.productCatagories}</span>
          <span className="badge badge-grey">{product.frameTypes}</span>
        </div>
        <div className="product-card-price">From ₹—</div>
        <button
          className="btn btn-primary btn-sm btn-full"
          onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`) }}
        >
          Customise →
        </button>
      </div>
    </div>
  )
}
