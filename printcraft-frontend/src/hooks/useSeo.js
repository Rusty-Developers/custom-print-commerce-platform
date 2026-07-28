import { useEffect } from 'react'

/**
 * useSeo — sets the browser tab title and meta description per page.
 * Call at the top of each page component with static or derived values.
 *
 * @param {string} title       Full page title (e.g. "Shop Products — MK GROUP Printing")
 * @param {string} description Short meta description (140-160 chars ideal)
 */
export default function useSeo(title, description) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (meta) {
        meta.setAttribute('content', description)
      } else {
        meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = description
        document.head.appendChild(meta)
      }
    }
    // Restore default on unmount
    return () => {
      document.title = 'MK GROUP Printing — Premium Custom Photo Prints'
    }
  }, [title, description])
}
