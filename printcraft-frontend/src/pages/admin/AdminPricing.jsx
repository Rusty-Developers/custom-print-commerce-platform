import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import { formatINR, SIZE_LABELS, THICKNESS_LABELS, ALL_SIZES, ALL_THICKNESSES } from '../../utils/format'

function cellKey(size, thickness) {
  return `${size}_${thickness}`
}

export default function AdminPricing() {
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [grid, setGrid] = useState([])
  const [gridLoading, setGridLoading] = useState(false)
  const [gridError, setGridError] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [savingCell, setSavingCell] = useState(null)

  useEffect(() => {
    setProductsLoading(true)
    api.get('/api/products')
      .then((r) => setProducts(r.data || []))
      .catch(() => { setProductsError(true); toast.error('Failed to load products') })
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) { setGrid([]); return }
    setGridLoading(true)
    setGridError(false)
    setEditingCell(null)
    api.get(`/api/admin/products/${selectedId}/pricing-grid`)
      .then((r) => setGrid(r.data || []))
      .catch(() => { setGridError(true); toast.error('Failed to load pricing grid') })
      .finally(() => setGridLoading(false))
  }, [selectedId])

  const getCell = (size, thickness) =>
    grid.find((c) => c.sizeInches === size && c.thickness === thickness)

  const openEdit = (size, thickness) => {
    const cell = getCell(size, thickness)
    setEditingCell({ size, thickness })
    setEditPrice(cell?.basePrice != null ? String(cell.basePrice) : '')
    setEditActive(cell?.isActive ?? true)
  }

  const cancelEdit = () => setEditingCell(null)

  const saveCell = async () => {
    if (!editingCell || !selectedId) return
    const { size, thickness } = editingCell
    const price = parseFloat(editPrice)
    if (Number.isNaN(price) || price < 0) {
      toast.error('Enter a valid price')
      return
    }
    setSavingCell(cellKey(size, thickness))
    try {
      const res = await api.put(`/api/admin/products/${selectedId}/pricing`, {
        productSizeInches: size,
        productThickness: thickness,
        basePrice: price,
        isActive: editActive,
      })
      setGrid((prev) => prev.map((c) => {
        if (c.sizeInches !== size || c.thickness !== thickness) return c
        return {
          ...c,
          sizeInches: size,
          thickness,
          basePrice: res.data.basePrice,
          isActive: res.data.isActive,
          isSet: true,
        }
      }))
      setEditingCell(null)
      toast.success('Price saved')
    } catch {
      toast.error('Failed to save price')
    } finally {
      setSavingCell(null)
    }
  }

  const renderCell = (size, thickness) => {
    const cell = getCell(size, thickness)
    const key = cellKey(size, thickness)
    const isEditing = editingCell?.size === size && editingCell?.thickness === thickness
    const isSaving = savingCell === key

    if (isSaving) {
      return (
        <td key={key} style={{ textAlign: 'center', padding: 16 }}>
          <Spinner size="sm" />
        </td>
      )
    }

    if (isEditing) {
      return (
        <td key={key} style={{ padding: 10, verticalAlign: 'top', minWidth: 140 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="Price"
              autoFocus
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
              Active
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveCell}>Save</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </td>
      )
    }

    if (!cell?.isSet) {
      return (
        <td
          key={key}
          onClick={() => openEdit(size, thickness)}
          style={{
            border: '2px dashed #D1D5DB', background: '#F9F9F9', textAlign: 'center',
            cursor: 'pointer', padding: 20, color: '#9CA3AF', fontSize: 13, fontWeight: 600,
          }}
        >
          + Set Price
        </td>
      )
    }

    const active = cell.isActive
    return (
      <td
        key={key}
        onClick={() => openEdit(size, thickness)}
        style={{
          border: '1px solid #E5E7EB',
          background: active ? 'white' : '#FFF8E1',
          cursor: 'pointer', padding: 14, verticalAlign: 'top',
        }}
      >
        <div style={{ fontWeight: 700, color: active ? '#166534' : '#B45309', fontSize: 15 }}>
          {formatINR(cell.basePrice)}
        </div>
        <div style={{ fontSize: 11, marginTop: 6, color: active ? '#166534' : '#92400E' }}>
          {active ? '● Active' : '● Inactive'}
        </div>
        {!active && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>(inactive)</div>
        )}
      </td>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Pricing Grid</h1>

      <div className="form-group" style={{ maxWidth: 400, marginBottom: 24 }}>
        <label className="form-label">Select Product</label>
        {productsLoading ? <Spinner size="sm" /> : productsError ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Failed to load products</p>
        ) : (
          <select className="form-input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">— Choose a product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.productName}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedId && (
        <p style={{ color: 'var(--text-muted)' }}>Select a product to manage its pricing grid.</p>
      )}

      {selectedId && gridLoading && <Spinner center />}

      {selectedId && gridError && !gridLoading && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Failed to load pricing grid.</p>
      )}

      {selectedId && !gridLoading && !gridError && (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th>Size / Thickness</th>
                {ALL_THICKNESSES.map((t) => (
                  <th key={t} style={{ textAlign: 'center' }}>{THICKNESS_LABELS[t]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_SIZES.map((size) => (
                <tr key={size}>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{SIZE_LABELS[size]}</td>
                  {ALL_THICKNESSES.map((t) => renderCell(size, t))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
