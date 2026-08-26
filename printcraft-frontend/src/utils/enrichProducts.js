/**
 * enrichProducts.js
 *
 * Fetches the minimum active base price for every product in the list and
 * injects it as `product.basePrice`.  Uses Promise.allSettled so a single
 * failed pricing call never blocks the rest of the page from rendering.
 *
 * Endpoint used: GET /api/products/:id/pricing  (public, no auth required)
 * Response shape: Array<{ sizeInches, thickness, basePrice, isActive, ... }>
 */
import api from '../api/axios'

/**
 * @param {Array<{id: string|number, [key: string]: any}>} products
 * @returns {Promise<Array<{id: string|number, basePrice: number|null, [key: string]: any}>>}
 */
export async function enrichProductsWithBasePrice(products) {
  if (!products.length) return products

  const results = await Promise.allSettled(
    products.map((p) =>
      api
        .get(`/api/products/${p.id}/pricing`)
        .then((r) => ({ id: p.id, pricing: r.data || [] }))
    )
  )

  // Build a map of productId → minimum active basePrice
  const priceMap = {}
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return
    const { id, pricing } = result.value
    const activePrices = pricing
      .filter((entry) => entry.isActive !== false && entry.basePrice != null)
      .map((entry) => Number(entry.basePrice))
    priceMap[id] = activePrices.length > 0 ? Math.min(...activePrices) : null
  })

  return products.map((p) => ({
    ...p,
    basePrice: priceMap[p.id] ?? p.basePrice ?? null,
  }))
}
