import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import ProductCard from '../components/ProductCard'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'TILES', label: 'Tiles' },
  { key: 'PVC', label: 'PVC' },
  { key: 'GLASS', label: 'Glass' },
  { key: 'METAL', label: 'Metal' },
  { key: 'WOOD', label: 'Wood' },
  { key: 'ACRYLIC', label: 'Acrylic' },
  { key: 'PHOTO_FRAME', label: 'Photo Frame' },
  { key: 'POSTER', label: 'Poster' },
  { key: 'CREATIVE', label: 'Creative' },
]

export default function ProductsPage() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'ALL'

  useEffect(() => {
    api.get('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filter by category
  const filtered = activeCategory === 'ALL'
    ? products
    : products.filter((p) => p.productCatagories === activeCategory)

  const setCategory = (cat) => {
    if (cat === 'ALL') setSearchParams({})
    else setSearchParams({ category: cat })
  }

  return (
    <div className="page-enter" style={{ minHeight: '70vh', background: '#FFFFFF' }}>
      {/* Clean minimal header */}
      <div className="pc-products-header">
        <div className="container">
          <h1 className="pc-products-title">Our Collection</h1>
          <p className="pc-products-subtitle">
            See how your photos look in every frame — live preview below
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 0, paddingBottom: 48 }}>
        {/* Category Filter Tabs */}
        <div className="pc-filter-tabs" id="category-filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`pc-filter-tab${activeCategory === tab.key ? ' active' : ''}`}
              onClick={() => setCategory(tab.key)}
              id={`filter-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="pc-results-count">
          {loading ? '...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <Spinner center />
        ) : filtered.length === 0 ? (
          <div className="pc-empty-state">
            <div className="pc-empty-icon">🎨</div>
            <h3 className="pc-empty-title">No products found</h3>
            <p className="pc-empty-text">
              No products found in this category. Try another one!
            </p>
            <button className="btn btn-primary" onClick={() => setCategory('ALL')}>
              View All Products
            </button>
          </div>
        ) : (
          <div className="pc-product-grid" id="products-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
