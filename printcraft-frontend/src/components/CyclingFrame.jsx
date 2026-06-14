import { memo, forwardRef, useRef } from 'react'
import {
  usePhotoCycle,
  useInView,
  GLASS_OVERLAY,
  EDGE_HIGHLIGHT,
  IMG_BASE,
} from '../utils/framePreview'

const CyclingFrame = memo(forwardRef(function CyclingFrame(
  {
    photos,
    width,
    height,
    frameStyle = {},
    className = '',
    boxShadow = '0 20px 60px rgba(0,0,0,0.5)',
    pauseWhenHidden = true,
    eager = false,
  },
  ref
) {
  const innerRef = useRef(null)
  const inView = useInView(innerRef, '100px')
  const active = !pauseWhenHidden || inView
  const { currentIndex, prevIndex, prevOpacity } = usePhotoCycle(photos, active)

  const setRef = (node) => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  return (
    <div
      ref={setRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width,
        height,
        ...frameStyle,
        boxShadow: frameStyle.boxShadow ?? boxShadow,
      }}
    >
      <img
        src={photos[prevIndex ?? currentIndex]}
        alt=""
        aria-hidden="true"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        style={{ ...IMG_BASE, opacity: prevIndex !== null ? prevOpacity : 0, zIndex: 1 }}
      />
      <img
        src={photos[currentIndex]}
        alt=""
        aria-hidden="true"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        style={{ ...IMG_BASE, opacity: 1, zIndex: 2 }}
      />
      <div style={GLASS_OVERLAY} />
      <div style={EDGE_HIGHLIGHT} />
    </div>
  )
}))

export default CyclingFrame
