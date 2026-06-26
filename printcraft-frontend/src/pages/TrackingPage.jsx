import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

// ── Full enum from backend DeliveryStatus.java ──────────────────────────────
const DELIVERY_STEPS = [
  'CREATED',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERY_ATTEMPTED',
  'DELIVERED',
]

const TERMINAL_STATUSES = ['DELIVERED', 'FAILED_FINAL', 'RTO_INITIATED']

const STATUS_META = {
  CREATED:            { icon: '📋', label: 'Order Created' },
  PACKED:             { icon: '📦', label: 'Packed' },
  SHIPPED:            { icon: '🚚', label: 'Shipped' },
  IN_TRANSIT:         { icon: '🛣️',  label: 'In Transit' },
  OUT_FOR_DELIVERY:   { icon: '🏍️', label: 'Out for Delivery' },
  DELIVERY_ATTEMPTED: { icon: '🔔', label: 'Delivery Attempted' },
  DELIVERED:          { icon: '✅', label: 'Delivered' },
  FAILED_FINAL:       { icon: '❌', label: 'Delivery Failed' },
  RTO_INITIATED:      { icon: '↩️', label: 'Return Initiated' },
}

const STATUS_RANK = {
  CREATED: 1, PACKED: 2, SHIPPED: 3, IN_TRANSIT: 4,
  OUT_FOR_DELIVERY: 5, DELIVERY_ATTEMPTED: 5,
  DELIVERED: 6, FAILED_FINAL: 6, RTO_INITIATED: 6,
}

function getBadgeStyle(status) {
  if (status === 'DELIVERED')          return { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }
  if (status === 'FAILED_FINAL')       return { background: '#fee2e2', color: '#7f1d1d', border: '1px solid #fca5a5' }
  if (status === 'RTO_INITIATED')      return { background: '#fef3c7', color: '#78350f', border: '1px solid #fcd34d' }
  if (status === 'DELIVERY_ATTEMPTED') return { background: '#fef3c7', color: '#78350f', border: '1px solid #fcd34d' }
  return { background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd' }
}

function isStepDone(stepStatus, currentStatus) {
  return STATUS_RANK[stepStatus] < STATUS_RANK[currentStatus]
}
function isStepCurrent(stepStatus, currentStatus) {
  return stepStatus === currentStatus ||
    (STATUS_RANK[stepStatus] === STATUS_RANK[currentStatus] && stepStatus === currentStatus)
}

export default function TrackingPage() {
  const [searchParams] = useSearchParams()
  const rawOrderId = searchParams.get('orderId') || ''

  // input holds what the user types; orderId drives the actual API call
  const [input, setInput]     = useState(rawOrderId)
  const [orderId, setOrderId] = useState(rawOrderId)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const inputRef = useRef(null)

  const doTrack = (id) => {
    const trimmed = String(id).trim()
    if (!trimmed) { toast.error('Please enter your Order ID'); return }
    if (isNaN(Number(trimmed))) { toast.error('Order ID must be a number'); return }

    setLoading(true)
    setNotFound(false)
    setData(null)

    // Backend: GET /api/tracking/{orderId}  (orderId is a Long)
    api.get(`/api/tracking/${trimmed}`)
      .then(r => setData(r.data))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
        else toast.error('Failed to fetch tracking info. Please try again.')
      })
      .finally(() => setLoading(false))
  }

  // Auto-track if orderId comes from URL query param
  useEffect(() => {
    if (orderId) doTrack(orderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentStatus = data?.currentStatus   // e.g. "IN_TRANSIT"
  const currentRank   = STATUS_RANK[currentStatus] ?? -1

  // Determine which steps to show — always show the linear path, append
  // FAILED_FINAL / RTO_INITIATED if that's the terminal state
  const stepsToRender = [...DELIVERY_STEPS]
  if (currentStatus === 'FAILED_FINAL')  stepsToRender.push('FAILED_FINAL')
  if (currentStatus === 'RTO_INITIATED') stepsToRender.push('RTO_INITIATED')

  return (
    <>
      <style>{`
        @keyframes trackPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.45); }
          50%      { box-shadow: 0 0 0 8px rgba(192,57,43,0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .track-card { animation: fadeInUp 0.38s ease both; }
        .track-input:focus { border-color: #C0392B !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.15) !important; outline: none; }
        .track-btn-pulse:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(192,57,43,0.35) !important; }
        .step-pulse { animation: trackPulse 1.6s ease-in-out infinite; }
        .event-row:not(:last-child) { border-bottom: 1px solid var(--divider, #e5e7eb); }
      `}</style>

      <div className="page-enter" style={{ padding: '60px 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 700 }}>

          {/* ── Heading ───────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 36, fontWeight: 800, marginBottom: 8,
              background: 'linear-gradient(135deg,#C0392B,#e74c3c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              📦 Track Your Order
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Enter your <strong>Order ID</strong> to get real-time delivery updates.
            </p>
          </div>

          {/* ── Search Bar ────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 40,
            background: 'var(--surface, #fff)', borderRadius: 16,
            padding: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid var(--divider, #e5e7eb)',
          }}>
            <input
              ref={inputRef}
              className="form-input track-input"
              type="number"
              min="1"
              placeholder="e.g. 1042  (your Order ID)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setOrderId(input); doTrack(input) } }}
              style={{
                flex: 1, borderRadius: 10, fontSize: 15,
                border: '1.5px solid var(--divider, #e5e7eb)',
                padding: '10px 14px', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <button
              id="track-order-btn"
              className="btn btn-primary track-btn-pulse"
              onClick={() => { setOrderId(input); doTrack(input) }}
              style={{
                borderRadius: 10, padding: '10px 24px', fontWeight: 700,
                fontSize: 15, whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              🔍 Track
            </button>
          </div>

          {/* ── Loading ───────────────────────────────────────────────── */}
          {loading && <Spinner center />}

          {/* ── Not Found ─────────────────────────────────────────────── */}
          {notFound && !loading && (
            <div style={{
              textAlign: 'center', padding: '52px 24px',
              background: 'var(--surface, #fff)', borderRadius: 20,
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              border: '1px solid var(--divider, #e5e7eb)',
            }}>
              <div style={{ fontSize: 54, marginBottom: 16 }}>📭</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Order Not Found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
                We couldn't find an order with ID <strong>{input}</strong>.
                Double-check your Order ID from your confirmation email or the
                <a href="/account" style={{ color: '#C0392B', marginLeft: 4 }}>My Orders</a> page.
              </p>
            </div>
          )}

          {/* ── Tracking Result Card ──────────────────────────────────── */}
          {data && !loading && (
            <div className="track-card" style={{
              background: 'var(--surface, #fff)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
              border: '1px solid var(--divider, #e5e7eb)',
              overflow: 'hidden',
            }}>

              {/* Header bar */}
              <div style={{
                background: 'linear-gradient(135deg,#C0392B 0%,#e74c3c 100%)',
                padding: '22px 28px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>Order ID</div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', fontFamily: 'monospace' }}>
                    #{data.orderId}
                  </div>
                </div>
                <span style={{
                  padding: '6px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13,
                  background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  {STATUS_META[currentStatus]?.icon} {currentStatus?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Meta info row */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 20,
                padding: '18px 28px', borderBottom: '1px solid var(--divider, #e5e7eb)',
                background: 'var(--surface-raised, #fafafa)',
              }}>
                {data.location && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Location</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>📍 {data.location}</div>
                  </div>
                )}
                {data.estimatedDeliveryDate && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Delivery</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      📅 {new Date(data.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Delivery Stepper ───────────────────────────────────── */}
              <div style={{ padding: '28px 28px 8px' }}>
                <h3 style={{
                  fontSize: 14, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 24,
                }}>Delivery Progress</h3>

                <div style={{ position: 'relative', paddingLeft: 36 }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute', left: 9, top: 10,
                    width: 2, height: 'calc(100% - 20px)',
                    background: 'linear-gradient(to bottom, #C0392B 0%, #e5e7eb 100%)',
                    borderRadius: 2,
                  }} />

                  {stepsToRender.map((step) => {
                    const done    = isStepDone(step, currentStatus)
                    const current = step === currentStatus
                    const meta    = STATUS_META[step] || { icon: '•', label: step.replace(/_/g, ' ') }
                    // events for this step from the timeline
                    const events  = (data.eventDTOS || []).filter(e => e.status === step)

                    return (
                      <div key={step} style={{ marginBottom: 28, position: 'relative' }}>
                        {/* Step dot */}
                        <div
                          className={current ? 'step-pulse' : ''}
                          style={{
                            position: 'absolute', left: -36, top: 0,
                            width: 20, height: 20, borderRadius: '50%',
                            background: done ? '#C0392B' : current ? '#C0392B' : '#e5e7eb',
                            border: `2.5px solid ${done || current ? '#C0392B' : '#d1d5db'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1,
                          }}
                        >
                          {done    && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                          {current && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'block' }} />}
                        </div>

                        {/* Step label */}
                        <div style={{
                          fontWeight: done || current ? 700 : 500,
                          fontSize: 14,
                          color: done || current ? 'var(--text-dark, #111)' : 'var(--text-light, #9ca3af)',
                          marginBottom: events.length ? 6 : 0,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                          {current && (
                            <span style={{
                              ...getBadgeStyle(currentStatus),
                              fontSize: 11, padding: '1px 8px', borderRadius: 999,
                              fontWeight: 600, marginLeft: 4,
                            }}>Now</span>
                          )}
                        </div>

                        {/* Events under this step */}
                        {events.map((ev, j) => (
                          <div key={j} style={{
                            fontSize: 12, color: 'var(--text-muted)',
                            background: 'var(--surface-raised, #f8f9fa)',
                            borderRadius: 8, padding: '6px 10px', marginTop: 4,
                            border: '1px solid var(--divider, #e5e7eb)',
                          }}>
                            {ev.description && <span>{ev.description}</span>}
                            {ev.currentLocation && (
                              <span style={{ color: 'var(--text-light)', marginLeft: ev.description ? 6 : 0 }}>
                                — 📍 {ev.currentLocation}
                              </span>
                            )}
                            {ev.timestamp && (
                              <span style={{ marginLeft: 8, color: '#9ca3af', fontSize: 11 }}>
                                {new Date(ev.timestamp).toLocaleString('en-IN', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── Full Event History ─────────────────────────────────── */}
              {data.eventDTOS?.length > 0 && (
                <div style={{
                  margin: '8px 28px 28px',
                  background: 'var(--surface-raised, #f8f9fa)',
                  borderRadius: 14, border: '1px solid var(--divider, #e5e7eb)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '14px 18px', borderBottom: '1px solid var(--divider, #e5e7eb)',
                    fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                  }}>
                    🕐 Full Event History
                  </div>
                  {[...data.eventDTOS].reverse().map((ev, i) => {
                    const meta = STATUS_META[ev.status] || { icon: '•' }
                    return (
                      <div key={i} className="event-row" style={{
                        display: 'flex', gap: 14, padding: '12px 18px', fontSize: 13, alignItems: 'flex-start',
                      }}>
                        <div style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>{meta.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 1 }}>
                            {ev.status?.replace(/_/g, ' ')}
                          </div>
                          {ev.description && (
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{ev.description}</div>
                          )}
                          {ev.currentLocation && (
                            <div style={{ color: 'var(--text-light)', fontSize: 12 }}>📍 {ev.currentLocation}</div>
                          )}
                        </div>
                        <div style={{
                          fontSize: 11, color: 'var(--text-light)',
                          whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 2,
                        }}>
                          {ev.timestamp
                            ? new Date(ev.timestamp).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Help footer */}
              <div style={{
                padding: '14px 28px', borderTop: '1px solid var(--divider, #e5e7eb)',
                textAlign: 'center', fontSize: 13, color: 'var(--text-muted)',
              }}>
                Need help? <a href="/contact" style={{ color: '#C0392B', fontWeight: 600 }}>Contact Support</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
