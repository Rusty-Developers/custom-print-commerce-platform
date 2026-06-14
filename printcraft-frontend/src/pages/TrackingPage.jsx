import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

const DELIVERY_STEPS = ['CREATED','PACKED','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED']

export default function TrackingPage() {
  const [searchParams] = useSearchParams()
  const [trackingId, setTrackingId] = useState(searchParams.get('trackingId') || '')
  const [input, setInput] = useState(searchParams.get('trackingId') || '')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const doTrack = (tid) => {
    if (!tid.trim()) { toast.error('Enter a tracking ID'); return }
    setLoading(true); setNotFound(false); setData(null)
    api.get(`/api/tracking/${tid.trim()}`)
      .then(r => setData(r.data))
      .catch(err => { if (err.response?.status === 404) setNotFound(true); else toast.error('Failed to fetch tracking info') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (trackingId) doTrack(trackingId) }, [])

  const currentStepIdx = data ? DELIVERY_STEPS.indexOf(data.currentStatus) : -1

  return (
    <div className="page-enter" style={{ padding:'60px 0' }}>
      <div className="container" style={{ maxWidth:680 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:34, fontWeight:800, marginBottom:8, textAlign:'center' }}>Track Your Order</h1>
        <p style={{ color:'var(--text-muted)', textAlign:'center', marginBottom:36 }}>Enter your tracking ID to see real-time delivery updates.</p>

        <div style={{ display:'flex', gap:12, marginBottom:40 }}>
          <input className="form-input" placeholder="e.g. TRK-123456" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&doTrack(input)}
            style={{ flex:1, borderRadius:'var(--radius-sm)' }} />
          <button className="btn btn-primary" onClick={() => { setTrackingId(input); doTrack(input) }} id="track-btn">🔍 Track</button>
        </div>

        {loading && <Spinner center />}

        {notFound && (
          <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p style={{ fontWeight:600 }}>Tracking ID not found. Please check and try again.</p>
          </div>
        )}

        {data && (
          <div style={{ background:'white', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)', border:'1px solid var(--divider)', padding:28 }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--divider)' }}>
              <div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:2 }}>Tracking ID</div>
                <div style={{ fontWeight:700, fontFamily:'monospace', fontSize:17 }}>{data.trackingId}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(data.trackingId); toast.success('Copied!') }}>📋 Copy ID</button>
              <div>
                <span className={`badge ${data.currentStatus==='DELIVERED'?'badge-green':'badge-amber'}`}>{data.currentStatus?.replace(/_/g,' ')}</span>
              </div>
            </div>
            {data.currentLocation && <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>📍 Current Location: <strong>{data.currentLocation}</strong></div>}
            {data.estimatedDeliveryDate && <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>📅 Estimated Delivery: <strong>{new Date(data.estimatedDeliveryDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</strong></div>}

            {/* Stepper */}
            <div style={{ position:'relative', paddingLeft:28 }}>
              {DELIVERY_STEPS.map((step, i) => {
                const done = i < currentStepIdx; const current = i === currentStepIdx
                const events = (data.eventDTOS || []).filter(e => e.status === step)
                return (
                  <div key={step} style={{ marginBottom:24, position:'relative' }}>
                    <div style={{ position:'absolute', left:-28, top:0, width:20, height:20, borderRadius:'50%',
                      background:done||current?'#C0392B':'#E5E7EB', border:`2px solid ${done||current?'#C0392B':'#D1D5DB'}`,
                      animation:current?'pulse 1.5s infinite':'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {done && <span style={{ color:'white', fontSize:11, lineHeight:1 }}>✓</span>}
                      {current && <span style={{ width:8, height:8, borderRadius:'50%', background:'white', display:'block' }} />}
                    </div>
                    {i < DELIVERY_STEPS.length-1 && <div style={{ position:'absolute', left:-19, top:20, width:2, height:28, background:done?'#C0392B':'#E5E7EB' }} />}
                    <div style={{ fontWeight:700, fontSize:14, color:done||current?'var(--text-dark)':'var(--text-light)', marginBottom:2 }}>{step.replace(/_/g,' ')}</div>
                    {events.map((ev, j) => (
                      <div key={j} style={{ fontSize:12, color:'var(--text-muted)' }}>
                        {ev.description}{ev.currentLocation?` — ${ev.currentLocation}`:''}
                        {ev.timestamp && <span style={{ marginLeft:8, color:'var(--text-light)' }}>{new Date(ev.timestamp).toLocaleString('en-IN')}</span>}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Full event history */}
            {data.eventDTOS?.length > 0 && (
              <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--divider)' }}>
                <h4 style={{ fontFamily:'var(--font-heading)', fontSize:15, fontWeight:700, marginBottom:12 }}>Full Event History</h4>
                {[...data.eventDTOS].reverse().map((ev, i) => (
                  <div key={i} style={{ display:'flex', gap:12, fontSize:13, marginBottom:10, paddingBottom:10, borderBottom:'1px solid var(--divider)' }}>
                    <div style={{ minWidth:90, color:'var(--text-light)', fontSize:11 }}>{ev.timestamp ? new Date(ev.timestamp).toLocaleString('en-IN') : ''}</div>
                    <div>
                      <div style={{ fontWeight:600 }}>{ev.status?.replace(/_/g,' ')}</div>
                      <div style={{ color:'var(--text-muted)' }}>{ev.description}</div>
                      {ev.currentLocation && <div style={{ color:'var(--text-light)' }}>📍 {ev.currentLocation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
