import { useState, useEffect, useRef } from 'react'
import { PHOTO_POOL } from './photoPool'

/**
 * Backward-compatible alias — every existing consumer (CategoryShowcase, etc.)
 * keeps working without changes while now drawing from local photos.
 */
export const SAMPLE_PHOTOS = PHOTO_POOL
export const HERO_PHOTOS   = PHOTO_POOL.slice(0, 4)

export const DEFAULT_SHADOW = '0 8px 32px rgba(0,0,0,0.2), 0 20px 60px rgba(0,0,0,0.12)'

export const GLASS_OVERLAY = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  background:
    'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0.22) 33%, rgba(255,255,255,0.10) 38%, rgba(255,255,255,0) 44%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.14) 63%, rgba(255,255,255,0.06) 67%, rgba(255,255,255,0) 72%)',
  mixBlendMode: 'overlay',
}

export const EDGE_HIGHLIGHT = {
  position: 'absolute',
  inset: 0,
  zIndex: 11,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), inset 1px 0 0 rgba(255,255,255,0.3), inset -1px 0 0 rgba(0,0,0,0.05)',
}

export const IMG_BASE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  // Individual transition overridden per-usage in CyclingFrame
  transition: 'opacity 1.2s ease-in-out',
}

export function getFrameShapeStyles(frameType, productName) {
  const name = (productName || '').toLowerCase()

  if (name.includes('extra rounded')) {
    return { width: 160, height: 200, borderRadius: '40px', boxShadow: DEFAULT_SHADOW }
  }
  if (name.includes('bean')) {
    return {
      width: 170,
      height: 200,
      clipPath:
        "path('M 85 0 C 140 0 170 40 170 85 C 170 148 128 200 85 195 C 34 200 0 155 0 100 C 0 38 28 0 85 0')",
      boxShadow: DEFAULT_SHADOW,
    }
  }
  if (name.includes('egg')) {
    return {
      width: 160,
      height: 200,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      boxShadow: DEFAULT_SHADOW,
    }
  }

  switch (frameType) {
    case 'PORTRAIT':
      return {
        width: 160,
        height: 210,
        borderRadius: '8px',
        border: '1.5px solid rgba(255,255,255,0.3)',
        boxShadow: DEFAULT_SHADOW,
      }
    case 'LANDSCAPE':
      return { width: 220, height: 155, borderRadius: '8px', boxShadow: DEFAULT_SHADOW }
    case 'CIRCULAR':
      return { width: 170, height: 170, borderRadius: '50%', boxShadow: DEFAULT_SHADOW }
    case 'FLOATING':
      return {
        width: 170,
        height: 210,
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 20px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
      }
    case 'BORDERED':
      return {
        width: 160,
        height: 210,
        borderRadius: '8px',
        border: '10px solid #5a3e2b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }
    case 'POSTER':
      return {
        width: 140,
        height: 200,
        borderRadius: '4px',
        border: '2px solid #222',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }
    default:
      return {
        width: 160,
        height: 210,
        borderRadius: '8px',
        border: '1.5px solid rgba(255,255,255,0.3)',
        boxShadow: DEFAULT_SHADOW,
      }
  }
}

export function getCategoryFrameStyle(category) {
  if (['WOOD', 'ACRYLIC'].includes(category)) {
    return { borderRadius: '8px', border: '6px solid #5a3e2b' }
  }
  if (category === 'PHOTO_FRAME') return { borderRadius: '40px' }
  if (category === 'POSTER') return { borderRadius: '4px', border: '2px solid #222' }
  if (category === 'CREATIVE') return { borderRadius: '50%' }
  return { borderRadius: '8px', border: '1.5px solid rgba(0,0,0,0.15)' }
}

/**
 * Photo cycle hook — pauses when inactive or tab hidden.
 *
 * @param {string[]}          photos           Photo URL array
 * @param {boolean}           active           Pause cycling when false
 * @param {number}            initialIndex     Starting photo index
 * @param {number}            period           Cycle interval in ms (default 7500)
 * @param {number}            staggerOffset    Delay before first tick in ms (default 0)
 * @param {number|undefined}  frameSlot        This frame's slot (for collision check)
 * @param {React.RefObject}   sharedIndexesRef Shared ref holding all frames' current indexes
 */
export function usePhotoCycle(
  photos,
  active = true,
  initialIndex,
  period = 7500,
  staggerOffset = 0,
  frameSlot = undefined,
  sharedIndexesRef = undefined
) {
  const startRef = useRef(
    initialIndex !== undefined ? initialIndex : Math.floor(Math.random() * photos.length)
  )
  const [currentIndex, setCurrentIndex] = useState(startRef.current)
  const [prevIndex, setPrevIndex]       = useState(null)
  const [prevOpacity, setPrevOpacity]   = useState(1)
  const [tabVisible, setTabVisible]     = useState(() => !document.hidden)

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const running = active && tabVisible

  useEffect(() => {
    if (!running) return

    const tick = () => {
      setCurrentIndex(idx => {
        setPrevIndex(idx)
        setPrevOpacity(1)
        let next = (idx + 1) % photos.length

        // Collision prevention — skip indexes already displayed by sibling frames
        if (sharedIndexesRef && frameSlot !== undefined) {
          const others = sharedIndexesRef.current.filter((_, s) => s !== frameSlot)
          let attempts = 0
          while (others.includes(next) && attempts < photos.length) {
            next = (next + 1) % photos.length
            attempts++
          }
          sharedIndexesRef.current[frameSlot] = next
        }

        return next
      })
    }

    let intervalId
    // Stagger: delay the first tick, then run at steady period
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(tick, period)
    }, staggerOffset)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [photos.length, running, period, staggerOffset, frameSlot, sharedIndexesRef])

  // Fade out the previous image
  useEffect(() => {
    if (prevIndex === null) return
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPrevOpacity(0))
    })
    // Clear after fade completes (matches 1.2s transition)
    const timeout = setTimeout(() => setPrevIndex(null), 1300)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
  }, [prevIndex])

  return { currentIndex, prevIndex, prevOpacity }
}

/** Pause cycling when element leaves viewport */
export function useInView(ref, rootMargin = '0px') {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0, rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}
