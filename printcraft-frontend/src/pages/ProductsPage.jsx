import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import ProductCard from '../components/ProductCard'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/format'

export default function ProductsPage() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [sortBy, setSortBy]       = useState('default')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'ALL'
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filter
  const filtered = activeCategory === 'ALL'
    ? products
    : products.filter((p) => p.productCatagories === activeCategory)

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name-asc')  return a.productName.localeCompare(b.productName)
    if (sortBy === 'name-desc') return b.productName.localeCompare(a.productName)
    if (sortBy === 'newest')    return new Date(b.createdAt) - new Date(a.createdAt)
    return a.id - b.id
  })

  const setCategory = (cat) => {
    if (cat === 'ALL') setSearchParams({})
    else setSearchParams({ category: cat })
  }

  return (
    <div className="page-enter" style={{ minHeight: '70vh' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--primary-gradient)', padding: '48px 0 32px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 8 }}>
            All Products
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
            Discover our premium custom print collection
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          {/* Category tabs */}
          <div className="category-tabs">
            <button
              className={`category-tab${activeCategory === 'ALL' ? ' active' : ''}`}
              onClick={() => setCategory('ALL')}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: 180 }}
            id="sort-select"
          >
            <option value="default">Default</option>
            <option value="newest">Newest First</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
        </div>

        {/* Results count */}
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          {loading ? '...' : `${sorted.length} product${sorted.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <Spinner center />
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>🎨</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              No products found in this category. Try another one!
            </p>
            <button className="btn btn-primary" onClick={() => setCategory('ALL')}>View All Products</button>
          </div>
        ) : (
          <div className="product-grid">
            {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
