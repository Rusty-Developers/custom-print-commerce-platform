import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Spinner from './Spinner'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

function StateDropdown({ value, onChange }) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="form-input"
        placeholder="Search state"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        required
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, marginTop: 4,
          maxHeight: 180, overflowY: 'auto', background: 'white',
          border: '1px solid var(--border-color)', borderRadius: 8,
          boxShadow: 'var(--shadow-md)', listStyle: 'none', padding: 4, margin: '4px 0 0',
        }}>
          {filtered.map((state) => (
            <li key={state}>
              <button
                type="button"
                onClick={() => {
                  onChange(state)
                  setQuery(state)
                  setOpen(false)
                }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px',
                  border: 'none', background: value === state ? 'rgba(192,57,43,0.08)' : 'transparent',
                  borderRadius: 6, cursor: 'pointer', fontSize: 14,
                }}
              >
                {state}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AddressForm({ onSave, onCancel, compact = false }) {
  const [form, setForm] = useState({
    fullName: '', phoneNo: '', addressLine: '', landmark: '', pinCode: '', city: '', state: '',
  })
  const [loading, setLoading] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const handlePinChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setField('pinCode', val)
    setPinError('')

    if (val.length !== 6) return

    setPinLoading(true)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${val}`)
      const data = await res.json()
      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0]
        setForm((p) => ({
          ...p,
          pinCode: val,
          city: po.District || p.city,
          state: po.State || p.state,
        }))
      } else {
        setPinError('Invalid PIN code')
      }
    } catch {
      setPinError('Invalid PIN code')
    } finally {
      setPinLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[0-9]{6}$/.test(form.pinCode)) {
      toast.error('PIN code must be 6 digits')
      return
    }
    if (pinError) return
    if (!/^[6-9][0-9]{9}$/.test(form.phoneNo)) {
      toast.error('Enter a valid 10-digit Indian mobile number')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/api/user/addresses', { ...form, pinCode: parseInt(form.pinCode, 10) })
      toast.success('Address saved!')
      onSave(res.data)
    } catch {
      toast.error('Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const btnClass = compact ? 'btn btn-primary btn-sm' : 'btn btn-primary'
  const ghostClass = compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: compact ? 0 : '16px 0' }}>
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          className="form-input"
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number *</label>
        <input
          className="form-input"
          type="tel"
          placeholder="10-digit mobile"
          value={form.phoneNo}
          onChange={(e) => setField('phoneNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
          pattern="[6-9][0-9]{9}"
          maxLength={10}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Address Line *</label>
        <textarea
          className="form-input form-textarea"
          rows={2}
          placeholder="House no., Street, Area"
          value={form.addressLine}
          onChange={(e) => setField('addressLine', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Landmark <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(optional)</span>
        </label>
        <input
          className="form-input"
          type="text"
          placeholder="Near landmark"
          value={form.landmark}
          onChange={(e) => setField('landmark', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">PIN Code *</label>
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="6 digits"
            value={form.pinCode}
            onChange={handlePinChange}
            maxLength={6}
            pattern="[0-9]{6}"
            required
            style={{ paddingRight: pinLoading ? 40 : undefined }}
          />
          {pinLoading && (
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <Spinner size="sm" />
            </div>
          )}
        </div>
        {pinError && (
          <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{pinError}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">City *</label>
          <input
            className="form-input"
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">State *</label>
          <StateDropdown value={form.state} onChange={(v) => setField('state', v)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className={btnClass} disabled={loading || pinLoading}>
          {loading ? <Spinner size="sm" white /> : compact ? 'Save' : 'Save Address'}
        </button>
        {onCancel && (
          <button type="button" className={ghostClass} onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
