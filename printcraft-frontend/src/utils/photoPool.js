/**
 * photoPool.js
 * Auto-discovers all images from src/assets/sample_photos/ using Vite's
 * import.meta.glob. No manual filename maintenance required.
 */

const _modules = import.meta.glob('/src/assets/sample_photos/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** Fisher-Yates shuffle — runs once per page load */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Full pool of all local sample photos, shuffled once per page load.
 * Use this wherever you previously used SAMPLE_PHOTOS.
 */
export const PHOTO_POOL = shuffle(Object.values(_modules))

/**
 * Returns evenly-distributed starting indexes for `frameCount` frames
 * across the full pool, so no two frames start on the same image.
 *
 * With 73 photos and 4 frames → [0, 18, 36, 54]
 */
export function getFrameStartIndexes(frameCount = 4) {
  return Array.from({ length: frameCount }, (_, i) =>
    Math.floor((i * PHOTO_POOL.length) / frameCount)
  )
}
