/**
 * CyclingFrame — zero-blank-gap image carousel.
 *
 * Strategy: keep TWO <img> layers rendered at all times.
 *   • "prev" layer  = the exiting image, fades out
 *   • "curr" layer  = the incoming image, fades in
 *
 * Because both layers are rendered simultaneously (absolute-stacked),
 * the frame is NEVER empty — the previous photo stays fully visible
 * until the next one has fully loaded and faded in.
 *
 * This completely eliminates the blank-frame gap that `AnimatePresence
 * mode="wait"` caused (which fully unmounted the old image before mounting
 * the new one).
 */
import { memo, forwardRef, useRef, useEffect, useState, useCallback } from 'react'
import { useInView, GLASS_OVERLAY, EDGE_HIGHLIGHT } from '../utils/framePreview'

// ─── Crossfade timing ────────────────────────────────────────────────────────
const FADE_DURATION_MS  = 700   // ms — CSS transition duration
const FADE_EASE         = 'cubic-bezier(0.4, 0, 0.2, 1)'

// ─── Base image layer style ──────────────────────────────────────────────────
const baseImgStyle = {
  position:   'absolute',
  inset:       0,
  width:       '100%',
  height:      '100%',
  objectFit:  'cover',
  willChange: 'opacity',
  // Transition is set inline per-layer so duration is correct even on first render
}

// ─── Fallback when a photo fails to load ─────────────────────────────────────
const FALLBACK =
  'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=400&h=500&fit=crop'

// ─── Preload helper ──────────────────────────────────────────────────────────
function preloadImage(src) {
  if (!src) return
  const img = new Image()
  img.src = src
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
    cyclePeriod     = 7500,   // ms between photo changes
    staggerOffset   = 0,      // ms delay before first tick (for stagger effect)
    frameSlot,
    sharedIndexes,
  },
  ref
) {
  const innerRef = useRef(null)
  const inView   = useInView(innerRef, '100px')
  const active   = !pauseWhenHidden || inView

  // ── Index state ──────────────────────────────────────────────────────────
  const startIdx = useRef(
    initialIndex !== undefined
      ? initialIndex
      : Math.floor(Math.random() * Math.max(photos.length, 1))
  )

  const [currIdx, setCurrIdx] = useState(startIdx.current)
  const [prevIdx, setPrevIdx] = useState(null)  // null = no prev layer visible

  // Whether the prev layer is currently fading out
  const [prevFading, setPrevFading] = useState(false)

  // Tab visibility
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const running = active && tabVisible

  // ── Preload entire pool on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!photos.length) return
    photos.forEach(preloadImage)
  }, [photos])

  // ── Tick: advance to next photo ──────────────────────────────────────────
  const tick = useCallback(() => {
    if (!photos.length) return

    setCurrIdx(current => {
      // Pick next index (with collision prevention for hero frames)
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

      // Preload the one after next so it's ready when needed
      preloadImage(photos[(next + 1) % photos.length])

      // Move current → prev layer before updating current
      setPrevIdx(current)
      setPrevFading(true)

      // After the CSS fade completes, hide the prev layer
      setTimeout(() => {
        setPrevIdx(null)
        setPrevFading(false)
      }, FADE_DURATION_MS + 50)   // +50ms grace buffer

      return next
    })
  }, [photos, frameSlot, sharedIndexes])

  // ── Interval with stagger ────────────────────────────────────────────────
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

  // ── Ref forwarding ───────────────────────────────────────────────────────
  const setRef = node => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const onImgError = e => { e.target.src = FALLBACK }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={setRef}
      className={className}
      style={{
        position:        'relative',
        overflow:        'hidden',
        width,
        height,
        backgroundColor: '#EAE3DC',   // warm placeholder — never actually visible
        ...frameStyle,
        boxShadow: frameStyle.boxShadow ?? boxShadow,
      }}
    >
      {/*
        ── PREV layer (exiting image) ────────────────────────────────────────
        Stays at opacity:1 initially, then fades to 0 while the new image
        fades in on top. z-index lower so the incoming image renders above.
      */}
      {prevIdx !== null && (
        <img
          key={`prev-${prevIdx}`}
          src={photos[prevIdx]}
          alt=""
          aria-hidden="true"
          onError={onImgError}
          style={{
            ...baseImgStyle,
            zIndex:     1,
            opacity:    prevFading ? 0 : 1,
            transition: `opacity ${FADE_DURATION_MS}ms ${FADE_EASE}`,
          }}
        />
      )}

      {/*
        ── CURR layer (incoming image) ───────────────────────────────────────
        Starts at opacity:1 (because it's on top and the prev layer is still
        visible below). On the very first render there is no prev layer so it
        just appears immediately — no flash, no gap.
      */}
      <img
        key={`curr-${currIdx}`}
        src={photos[currIdx]}
        alt=""
        aria-hidden="true"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={onImgError}
        style={{
          ...baseImgStyle,
          zIndex:     2,
          opacity:    1,
          // Subtle ken-burns scale while displayed — purely cosmetic, GPU-only
          transition: `transform ${cyclePeriod}ms linear`,
          transform:  'scale(1.04)',
        }}
        // Immediately after mount, kick off the slow scale
        ref={el => {
          if (!el) return
          // rAF ensures the initial transform is committed before we animate
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.transform = 'scale(1.00)'
            })
          })
        }}
      />

      {/* Glass sheen + edge highlight — always on top */}
      <div style={{ ...GLASS_OVERLAY, zIndex: 10 }} />
      <div style={{ ...EDGE_HIGHLIGHT, zIndex: 11 }} />
    </div>
  )
}))

export default CyclingFrame
