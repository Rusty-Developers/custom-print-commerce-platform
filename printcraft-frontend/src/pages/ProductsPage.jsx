import { useState, useEffect, useRef, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import ProductCard from '../components/ProductCard'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  ...ALL_CATEGORIES.map((cat) => ({ key: cat, label: CATEGORY_LABELS[cat] })),
]

const RevealProductCard = memo(function RevealProductCard({ product, index }) {
  const cardRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = cardRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [product.id])

  return (
    <ProductCard
      ref={cardRef}
      product={product}
      className={visible ? 'visible' : ''}
      style={{ transitionDelay: `${index * 80}ms` }}
    />
  )
})

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'ALL'

  useEffect(() => {
    api
      .get('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeCategory === 'ALL'
      ? products
      : products.filter((p) => p.productCatagories === activeCategory)

  const setCategory = (cat) => {
    if (cat === 'ALL') setSearchParams({})
    else setSearchParams({ category: cat })
  }

  return (
    <div className="page-enter" style={{ minHeight: '70vh', background: '#FFFFFF' }}>
      <div className="pc-products-header">
        <div className="container">
          <h1 className="pc-products-title">Our Collection</h1>
          <p className="pc-products-subtitle">
            See how your photos look in every frame — live preview below
          </p>
          <p className="pc-products-live">Photos update every 3.5 seconds ✨</p>
        </div>
      </div>

      <div className="pc-filter-tabs-wrap">
        <div className="container">
          <div className="pc-filter-tabs" id="category-filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`pc-filter-tab${activeCategory === tab.key ? ' active' : ''}`}
                onClick={() => setCategory(tab.key)}
                id={`filter-tab-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 48 }}>
        <p className="pc-results-count">
          {loading ? '...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <Spinner center />
        ) : filtered.length === 0 ? (
          <div className="pc-empty-state">
            <div className="pc-empty-icon">🎨</div>
            <h3 className="pc-empty-title">No products found</h3>
            <p className="pc-empty-text">No products found in this category. Try another one!</p>
            <button type="button" className="btn btn-primary" onClick={() => setCategory('ALL')}>
              View All Products
            </button>
          </div>
        ) : (
          <div className="pc-product-grid pc-product-grid--animate" id="products-grid">
            {filtered.map((p, index) => (
              <RevealProductCard key={p.id} product={p} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
