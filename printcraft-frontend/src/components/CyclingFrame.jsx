import { memo, forwardRef, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  usePhotoCycle,
  useInView,
  GLASS_OVERLAY,
  EDGE_HIGHLIGHT,
} from '../utils/framePreview'

/** Image base layout (no transition — Framer Motion owns that) */
const IMG_LAYOUT = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const TRANSITION = {
  duration: 0.55,
  ease: [0.25, 0.1, 0.25, 1],
}

const CyclingFrame = memo(forwardRef(function CyclingFrame(
  {
    photos,
    width,
    height,
    frameStyle = {},
    className = '',
    boxShadow = '0 4px 24px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.28)',
    pauseWhenHidden = true,
    eager = false,
    initialIndex,
    /** Cycle period in ms */
    cyclePeriod = 7500,
    /** Delay before first tick — used to stagger hero frames */
    staggerOffset = 0,
    /** Slot index within a sibling group (for collision prevention) */
    frameSlot,
    /** Shared mutable ref holding current indexes of all sibling frames */
    sharedIndexes,
  },
  ref
) {
  const innerRef = useRef(null)
  const inView   = useInView(innerRef, '100px')
  const active   = !pauseWhenHidden || inView

  const { currentIndex } = usePhotoCycle(
    photos,
    active,
    initialIndex,
    cyclePeriod,
    staggerOffset,
    frameSlot,
    sharedIndexes,
  )

  // Preload entire pool on mount
  useEffect(() => {
    if (!photos?.length) return
    photos.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [photos])

  const setRef = node => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const handleImgError = e => {
    e.target.src =
      'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=400&h=500&fit=crop'
  }

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
        boxShadow:       frameStyle.boxShadow ?? boxShadow,
      }}
    >
      {/*
        AnimatePresence mode="wait" ensures the outgoing image fully exits
        before the incoming one starts — clean luxury crossfade, no overlap flash.
        key={currentIndex} forces remount on every photo change.
      */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={photos[currentIndex]}
          alt=""
          aria-hidden="true"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width={width}
          height={height}
          style={IMG_LAYOUT}
          onError={handleImgError}
          initial={{ scale: 1.04, opacity: 0, z: 12 }}
          animate={{ scale: 1,    opacity: 1, z: 0  }}
          exit={{    scale: 0.97, opacity: 0, z: -12 }}
          transition={TRANSITION}
        />
      </AnimatePresence>

      <div style={GLASS_OVERLAY} />
      <div style={EDGE_HIGHLIGHT} />
    </div>
  )
}))

export default CyclingFrame
