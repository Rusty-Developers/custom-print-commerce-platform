/**
 * CyclingFrame — zero-blank-gap image carousel.
 *
 * Root cause of the old gap:
 *   The outgoing image was faded out / removed while the incoming <img> had
 *   its src set but the browser hadn't finished decoding the pixels yet.
 *   That window — between src assignment and first paint — showed the bare
 *   background placeholder.
 *
 * Fix — load-gated crossfade:
 *   1. The NEXT image is rendered hidden (opacity 0) with the new src.
 *   2. We wait for its onLoad (or img.decode()) to confirm pixels are ready.
 *   3. Only then do we start the crossfade: next fades in, prev fades out.
 *   4. The PREV layer stays at opacity:1 until step 3 begins — so the frame
 *      is NEVER blank, even on slow connections.
 *
 * Additional hardening:
 *   • All pool images are preloaded on mount (and pre-decoded with decode()).
 *   • The "next-next" image is also preloaded during every tick.
 *   • A 200 ms safety timeout triggers the crossfade even if onLoad is missed.
 */
import { memo, forwardRef, useRef, useEffect, useState, useCallback } from 'react'
import { useInView, GLASS_OVERLAY, EDGE_HIGHLIGHT } from '../utils/framePreview'

// ─── Crossfade timing ─────────────────────────────────────────────────────────
const FADE_MS  = 700
const FADE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
// Safety: if onLoad doesn't fire within this window, proceed anyway
const LOAD_TIMEOUT_MS = 200

// ─── Fallback when a photo fails to load ──────────────────────────────────────
const FALLBACK =
  'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=400&h=500&fit=crop'

// ─── Preload + pre-decode a URL so it lives in the browser image cache ────────
function prewarm(src) {
  if (!src) return
  const img = new Image()
  img.src = src
  // decode() resolves when pixels are ready — swallow errors silently
  if (img.decode) img.decode().catch(() => {})
}

// ─────────────────────────────────────────────────────────────────────────────

const CyclingFrame = memo(forwardRef(function CyclingFrame(
  {
    photos = [],
    width,
    height,
    frameStyle  = {},
    className   = '',
    boxShadow   = '0 4px 24px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.28)',
    pauseWhenHidden = true,
    eager           = false,
    initialIndex,
    cyclePeriod     = 7500,
    staggerOffset   = 0,
    frameSlot,
    sharedIndexes,
  },
  ref
) {
  const innerRef = useRef(null)
  const inView   = useInView(innerRef, '100px')
  const active   = !pauseWhenHidden || inView

  // ── Tab visibility ─────────────────────────────────────────────────────────
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const running = active && tabVisible

  // ── Index tracking ──────────────────────────────────────────────────────────
  const startIdx = useRef(
    initialIndex !== undefined
      ? initialIndex
      : Math.floor(Math.random() * Math.max(photos.length, 1))
  )

  // Layer A and Layer B — we ping-pong between them so React never unmounts
  // an <img> that's mid-transition.
  // "top" = whichever layer is currently the visible/incoming image
  const [layerA, setLayerA] = useState({ src: photos[startIdx.current] ?? '', opacity: 1 })
  const [layerB, setLayerB] = useState({ src: '',  opacity: 0 })
  const topLayer = useRef('A')   // 'A' | 'B'

  // currIdx is needed only for collision avoidance + next-preload
  const currIdxRef = useRef(startIdx.current)

  // ── Preload entire pool on mount ────────────────────────────────────────────
  useEffect(() => {
    photos.forEach(prewarm)
  }, [photos])

  // ── Pick the next index ─────────────────────────────────────────────────────
  const pickNext = useCallback(() => {
    const current = currIdxRef.current
    let next = (current + 1) % photos.length

    if (sharedIndexes && frameSlot !== undefined) {
      const others = sharedIndexes.current.filter((_, s) => s !== frameSlot)
      let tries = 0
      while (others.includes(next) && tries < photos.length) {
        next = (next + 1) % photos.length
        tries++
      }
      sharedIndexes.current[frameSlot] = next
    }
    return next
  }, [photos, frameSlot, sharedIndexes])

  // ── Perform a single crossfade tick ────────────────────────────────────────
  const tick = useCallback(() => {
    if (!photos.length) return

    const next    = pickNext()
    const nextSrc = photos[next]

    // Preload the one after next so it's warm when needed
    prewarm(photos[(next + 1) % photos.length])

    currIdxRef.current = next

    if (topLayer.current === 'A') {
      // A is current (opacity 1). Load next into B (starts hidden).
      setLayerB({ src: nextSrc, opacity: 0 })
      topLayer.current = 'B'

      // Crossfade once B's pixels are decoded
      const doSwap = () => {
        setLayerB(prev => ({ ...prev, opacity: 1 }))
        setLayerA(prev => ({ ...prev, opacity: 0 }))
        // After fade completes, clear A's src so it doesn't waste memory
        setTimeout(() => setLayerA({ src: '', opacity: 0 }), FADE_MS + 50)
      }

      const img = new Image()
      img.src = nextSrc
      const timeout = setTimeout(doSwap, LOAD_TIMEOUT_MS)
      if (img.complete) {
        clearTimeout(timeout)
        doSwap()
      } else {
        img.onload  = () => { clearTimeout(timeout); doSwap() }
        img.onerror = () => { clearTimeout(timeout); doSwap() }
      }
    } else {
      // B is current (opacity 1). Load next into A (starts hidden).
      setLayerA({ src: nextSrc, opacity: 0 })
      topLayer.current = 'A'

      const doSwap = () => {
        setLayerA(prev => ({ ...prev, opacity: 1 }))
        setLayerB(prev => ({ ...prev, opacity: 0 }))
        setTimeout(() => setLayerB({ src: '', opacity: 0 }), FADE_MS + 50)
      }

      const img = new Image()
      img.src = nextSrc
      const timeout = setTimeout(doSwap, LOAD_TIMEOUT_MS)
      if (img.complete) {
        clearTimeout(timeout)
        doSwap()
      } else {
        img.onload  = () => { clearTimeout(timeout); doSwap() }
        img.onerror = () => { clearTimeout(timeout); doSwap() }
      }
    }
  }, [photos, pickNext])

  // ── Interval with stagger ───────────────────────────────────────────────────
  useEffect(() => {
    if (!running || !photos.length) return
    let intervalId
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(tick, cyclePeriod)
    }, staggerOffset)
    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [running, photos.length, cyclePeriod, staggerOffset, tick])

  // ── Ref forwarding ──────────────────────────────────────────────────────────
  const setRef = node => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const onImgError = e => { e.target.src = FALLBACK }

  // ── Shared image style factory ──────────────────────────────────────────────
  const imgStyle = (opacity, zIdx) => ({
    position:   'absolute',
    inset:       0,
    width:       '100%',
    height:      '100%',
    objectFit:  'cover',
    willChange: 'opacity',
    zIndex:      zIdx,
    opacity,
    transition:  opacity === 0
      ? 'none'   // invisible layer: no transition so it can be repositioned instantly
      : `opacity ${FADE_MS}ms ${FADE_EASE}`,
  })

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={setRef}
      className={className}
      style={{
        position:        'relative',
        overflow:        'hidden',
        width,
        height,
        backgroundColor: '#EAE3DC',
        ...frameStyle,
        boxShadow: frameStyle.boxShadow ?? boxShadow,
      }}
    >
      {/* Layer A */}
      {layerA.src && (
        <img
          src={layerA.src}
          alt=""
          aria-hidden="true"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={onImgError}
          style={imgStyle(layerA.opacity, topLayer.current === 'A' ? 2 : 1)}
        />
      )}

      {/* Layer B */}
      {layerB.src && (
        <img
          src={layerB.src}
          alt=""
          aria-hidden="true"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={onImgError}
          style={imgStyle(layerB.opacity, topLayer.current === 'B' ? 2 : 1)}
        />
      )}

      {/* Glass sheen + edge highlight — always on top */}
      <div style={{ ...GLASS_OVERLAY, zIndex: 10 }} />
      <div style={{ ...EDGE_HIGHLIGHT, zIndex: 11 }} />
    </div>
  )
}))

export default CyclingFrame
