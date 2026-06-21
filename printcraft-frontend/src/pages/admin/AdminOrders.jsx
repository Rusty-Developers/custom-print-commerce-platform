import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import {
  formatINR, SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS, PAYMENT_STATUS_BADGE,
} from '../../utils/format'
import { ADMIN_ORDER_STATUS_BADGE, DELIVERY_STATUSES } from './adminUtils'

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterOrderId, setFilterOrderId] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const debouncedCustomer = useDebouncedValue(filterCustomer, 500)
  const [deliveryModal, setDeliveryModal] = useState(null)
  const [dlvForm, setDlvForm] = useState({ trackingId: '', newStatus: 'PACKED', location: '' })
  const [dlvSubmitting, setDlvSubmitting] = useState(false)

  const fetchOrders = () => {
    setLoading(true)
    setError(false)
    const params = {}
    if (filterStatus) params.orderStatus = filterStatus
    if (filterPayment) params.paymentStatus = filterPayment
    if (debouncedCustomer) params.customer = debouncedCustomer
    if (filterOrderId) params.orderId = filterOrderId
    if (filterFrom) params.from = filterFrom
    if (filterTo) params.to = filterTo
    api.get('/admin/orders', { params })
      .then((r) => setOrders(r.data || []))
      .catch(() => { setError(true); toast.error('Failed to fetch orders') })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [filterStatus, filterPayment, debouncedCustomer, filterOrderId, filterFrom, filterTo])

  const handleDeliveryUpdate = async () => {
    if (!dlvForm.trackingId.trim()) { toast.error('AWB Code required'); return }
    setDlvSubmitting(true)
    try {
      await api.patch('/api/admin/delivery/updateStatus', {
        trackingId: dlvForm.trackingId.trim(),
        newStatus: dlvForm.newStatus,
        location: dlvForm.location,
      })
      toast.success('Delivery status updated!')
      setDeliveryModal(null)
      fetchOrders()
    } catch {
      toast.error('Failed to update delivery status')
    } finally {
      setDlvSubmitting(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Orders</h1>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <select className="form-input" style={{ width: 170 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['PLACED', 'CONFIRMED', 'MODIFICATION_ALLOWED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="form-input" style={{ width: 150 }} value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
          <option value="">All Payments</option>
          {['PENDING', 'PAID', 'FAILED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="form-input" style={{ width: 180 }} placeholder="Customer name…" value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} />
        <input className="form-input" type="date" style={{ width: 150 }} value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} title="From date" />
        <input className="form-input" type="date" style={{ width: 150 }} value={filterTo} onChange={(e) => setFilterTo(e.target.value)} title="To date" />
        <input className="form-input" style={{ width: 120 }} placeholder="Order ID" value={filterOrderId} onChange={(e) => setFilterOrderId(e.target.value.replace(/\D/g, ''))} />
      </div>

      {loading ? <Spinner center /> : error ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Could not load orders.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table admin-table-zebra">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Product</th><th>Size</th><th>Thickness</th>
                <th>Frame</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No orders found</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td style={{ fontSize: 12 }}>{o.user?.name || o.user?.phoneNo || '—'}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product?.productName || '—'}</td>
                  <td style={{ fontSize: 12 }}>{SIZE_LABELS[o.productSizeInches] || o.productSizeInches}</td>
                  <td style={{ fontSize: 12 }}>{THICKNESS_LABELS[o.productThickness] || o.productThickness}</td>
                  <td style={{ fontSize: 12 }}>{FRAME_LABELS[o.frameTypes] || o.frameTypes}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(o.finalPrice)}</td>
                  <td><span className={`badge ${PAYMENT_STATUS_BADGE[o.paymentStatus] || 'badge-grey'}`}>{o.paymentStatus}</span></td>
                  <td><span className={`badge ${ADMIN_ORDER_STATUS_BADGE[o.orderStatus] || 'badge-grey'}`}>{o.orderStatus}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ fontSize: 11 }} onClick={() => {
                      setDeliveryModal(o)
                      setDlvForm({ trackingId: '', newStatus: 'PACKED', location: '' })
                    }}>
                      Update Delivery
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deliveryModal && (
        <div className="modal-overlay" onClick={() => setDeliveryModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Delivery — #{deliveryModal.id}</h3>
              <button type="button" className="cart-close-btn" onClick={() => setDeliveryModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">AWB Code *</label>
                <input className="form-input" value={dlvForm.trackingId} onChange={(e) => setDlvForm((f) => ({ ...f, trackingId: e.target.value }))} placeholder="Enter AWB / tracking code" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Status *</label>
                <select className="form-input" value={dlvForm.newStatus} onChange={(e) => setDlvForm((f) => ({ ...f, newStatus: e.target.value }))}>
                  {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={dlvForm.location} onChange={(e) => setDlvForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Mumbai Hub" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setDeliveryModal(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={dlvSubmitting} onClick={handleDeliveryUpdate}>
                {dlvSubmitting ? <Spinner size="sm" white /> : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
