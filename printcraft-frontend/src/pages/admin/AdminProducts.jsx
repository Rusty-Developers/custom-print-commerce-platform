import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import {
  CATEGORY_LABELS, FRAME_LABELS, ALL_CATEGORIES, ALL_FRAMES,
} from '../../utils/format'
import { isProductActive } from './adminUtils'

function ToggleSwitch({ active, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      disabled={disabled}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none', cursor: disabled ? 'wait' : 'pointer',
        background: active ? '#C0392B' : '#D1D5DB', position: 'relative', transition: 'background 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: active ? 23 : 3, width: 18, height: 18,
        borderRadius: '50%', background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function ImageUploadField({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/api/files/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      onChange(res.data.url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">Product Image *</label>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])} />
      <button type="button" className="btn btn-outline btn-sm" disabled={uploading}
        onClick={() => inputRef.current?.click()}>
        {uploading ? `Uploading ${progress}%…` : 'Upload Image'}
      </button>
      {uploading && (
        <div style={{ marginTop: 8, height: 4, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#C0392B', transition: 'width 0.2s' }} />
        </div>
      )}
      {value && (
        <img src={value} alt="Preview" style={{
          width: 80, height: 80, objectFit: 'cover', borderRadius: 8,
          marginTop: 10, border: '1px solid var(--divider)',
        }} />
      )}
    </div>
  )
}

export default function AdminProducts({ products, setProducts }) {
  const [showModal, setShowModal] = useState(false)
  const [editImageProduct, setEditImageProduct] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState('')
  const [form, setForm] = useState({
    productName: '', productCatagories: 'TILES', description: '', frameTypes: 'PORTRAIT', imageUrl: '',
  })
  const [creating, setCreating] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [savingImage, setSavingImage] = useState(false)

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const refreshProducts = async () => {
    const res = await api.get('/api/products')
    setProducts(res.data || [])
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.imageUrl) { toast.error('Please upload a product image'); return }
    setCreating(true)
    try {
      await api.post('/api/admin/products', form)
      toast.success('Product created!')
      setShowModal(false)
      setForm({ productName: '', productCatagories: 'TILES', description: '', frameTypes: 'PORTRAIT', imageUrl: '' })
      await refreshProducts()
    } catch {
      toast.error('Failed to create product')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (id) => {
    setTogglingId(id)
    try {
      await api.patch(`/api/admin/products/${id}/status`)
      setProducts((prev) => prev.map((p) => {
        if (p.id !== id) return p
        const next = !isProductActive(p)
        return { ...p, productActive: next, isProductActive: next }
      }))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleSaveImage = async () => {
    if (!editImageProduct || !editImageUrl) return
    setSavingImage(true)
    try {
      await api.patch(`/api/admin/products/${editImageProduct.id}/image`, { imageUrl: editImageUrl })
      toast.success('Image updated')
      setEditImageProduct(null)
      await refreshProducts()
    } catch {
      toast.error('Failed to update image')
    } finally {
      setSavingImage(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700 }}>Products</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-product-btn">+ Add Product</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table admin-table-zebra">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Frame Type</th>
              <th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const active = isProductActive(p)
              return (
                <tr key={p.id}>
                  <td>
                    <img className="admin-thumbnail" src={p.imageUrl || 'https://placehold.co/44x44'} alt={p.productName}
                      onError={(e) => { e.target.src = 'https://placehold.co/44x44/f9f9f9/ccc?text=P' }} />
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.productName}</td>
                  <td><span className="badge badge-grey">{CATEGORY_LABELS[p.productCatagories]}</span></td>
                  <td><span className="badge badge-grey">{FRAME_LABELS[p.frameTypes]}</span></td>
                  <td>{p.stockQuantity ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ToggleSwitch active={active} disabled={togglingId === p.id} onChange={() => handleToggle(p.id)} />
                      <span className={`badge ${active ? 'badge-green' : 'badge-grey'}`}>{active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditImageProduct(p); setEditImageUrl(p.imageUrl || '') }}>
                      Edit Image
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button type="button" className="cart-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.productName} onChange={set('productName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.productCatagories} onChange={set('productCatagories')}>
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frame Type *</label>
                  <select className="form-input" value={form.frameTypes} onChange={set('frameTypes')}>
                    {ALL_FRAMES.map((f) => <option key={f} value={f}>{FRAME_LABELS[f]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} />
                </div>
                <ImageUploadField value={form.imageUrl} onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} id="create-product-btn">
                  {creating ? <Spinner size="sm" white /> : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editImageProduct && (
        <div className="modal-overlay" onClick={() => setEditImageProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Image — {editImageProduct.productName}</h3>
              <button type="button" className="cart-close-btn" onClick={() => setEditImageProduct(null)}>✕</button>
            </div>
            <div className="modal-body">
              <ImageUploadField value={editImageUrl} onChange={setEditImageUrl} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setEditImageProduct(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={savingImage || !editImageUrl} onClick={handleSaveImage}>
                {savingImage ? <Spinner size="sm" white /> : 'Save Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
