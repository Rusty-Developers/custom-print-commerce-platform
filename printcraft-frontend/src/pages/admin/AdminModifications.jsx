import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import { SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS } from '../../utils/format'
import { parseRequestedChanges, confirmAction } from './adminUtils'

export default function AdminModifications() {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [detailMod, setDetailMod] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionId, setActionId] = useState(null)

  const fetchMods = () => {
    setLoading(true)
    setError(false)
    api.get('/api/admin/modifications/pending')
      .then((r) => setMods(r.data || []))
      .catch(() => { setError(true); toast.error('Failed to fetch modifications') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMods() }, [])

  const viewDetail = async (id) => {
    setDetailLoading(true)
    setDetailMod(null)
    try {
      const r = await api.get(`/api/admin/modifications/${id}`)
      setDetailMod(r.data)
    } catch {
      toast.error('Failed to load details')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!confirmAction('Approve this modification request?')) return
    setActionId(id)
    try {
      await api.put(`/api/admin/modifications/${id}/approve`)
      toast.success('Modification approved')
      setMods((prev) => prev.filter((m) => m.modificationRequestId !== id))
      setDetailMod(null)
    } catch {
      toast.error('Failed to approve')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    if (!confirmAction('Reject this modification request?')) return
    setActionId(id)
    try {
      await api.put(`/api/admin/modifications/${id}/reject`)
      toast.success('Modification rejected')
      setMods((prev) => prev.filter((m) => m.modificationRequestId !== id))
      setDetailMod(null)
    } catch {
      toast.error('Failed to reject')
    } finally {
      setActionId(null)
    }
  }

  const renderChanges = (detail) => {
    const lines = parseRequestedChanges(detail?.requestedChanges)
    if (lines.length === 0) return <span style={{ color: 'var(--text-muted)' }}>No changes specified</span>
    return (
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Modifications</h1>

      {loading ? <Spinner center /> : error ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Could not load modification requests.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table admin-table-zebra">
            <thead>
              <tr>
                <th>Request ID</th><th>Order ID</th><th>Customer</th><th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mods.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No pending modifications</td></tr>
              )}
              {mods.map((m) => (
                <tr key={m.modificationRequestId}>
                  <td>#{m.modificationRequestId}</td>
                  <td>#{m.orderId}</td>
                  <td>{m.username || '—'}</td>
                  <td><span className="badge badge-amber">{m.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(m.modificationRequestId)}>View Details</button>
                    <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#166534', border: 'none' }}
                      disabled={actionId === m.modificationRequestId}
                      onClick={() => handleApprove(m.modificationRequestId)}>
                      Approve
                    </button>
                    <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: 'none' }}
                      disabled={actionId === m.modificationRequestId}
                      onClick={() => handleReject(m.modificationRequestId)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(detailMod || detailLoading) && (
        <div className="modal-overlay" onClick={() => setDetailMod(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Modification Details</h3>
              <button type="button" className="cart-close-btn" onClick={() => setDetailMod(null)}>✕</button>
            </div>
            <div className="modal-body">
              {detailLoading ? <Spinner center /> : detailMod && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                  <div><strong>Request ID:</strong> #{detailMod.modificationRequestId}</div>
                  <div><strong>Order ID:</strong> #{detailMod.orderId}</div>
                  <div><strong>Customer:</strong> {detailMod.username}</div>
                  <div><strong>Status:</strong> <span className="badge badge-amber">{detailMod.status}</span></div>
                  <div>
                    <strong>Current:</strong>{' '}
                    {SIZE_LABELS[detailMod.currentSize] || detailMod.currentSize} ·{' '}
                    {FRAME_LABELS[detailMod.currentFrame] || detailMod.currentFrame} ·{' '}
                    {THICKNESS_LABELS[detailMod.currentThickness] || detailMod.currentThickness}
                  </div>
                  <div>
                    <strong>Requested changes:</strong>
                    <div style={{ marginTop: 6 }}>{renderChanges(detailMod)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#166534', border: 'none' }}
                      onClick={() => handleApprove(detailMod.modificationRequestId)}>Approve</button>
                    <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: 'none' }}
                      onClick={() => handleReject(detailMod.modificationRequestId)}>Reject</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
