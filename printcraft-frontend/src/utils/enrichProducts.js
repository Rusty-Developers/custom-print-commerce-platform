/**
 * enrichProducts.js
 *
 * Fetches the minimum active base price for every product in the list and
 * injects it as `product.basePrice`.  Uses Promise.allSettled so a single
 * failed pricing call never blocks the rest of the page from rendering.
 *
 * Endpoint used: GET /api/products/:id/pricing  (public, no auth required)
 *
 * Response shape from Spring/Jackson:
 *   Array<{
 *     sizeInches: string,   // e.g. "SIZE_8X12"
 *     thickness: string,    // e.g. "MM_3"
 *     basePrice: number,
 *     active: boolean,      // NOTE: Java `boolean isActive` → Jackson serialises as "active" (strips "is" prefix)
 *     set: boolean,         // NOTE: Java `boolean isSet`   → Jackson serialises as "set"
 *   }>
 *
 * The public endpoint already filters to isActive==true && isSet==true server-side
 * (PricingService.getAvailablePricing), so the response only contains valid priced rows.
 * We still guard against unexpected shapes defensively.
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
        .then((r) => ({ id: p.id, pricing: Array.isArray(r.data) ? r.data : [] }))
    )
  )

  // Build a map of productId → minimum basePrice from the pricing rows returned
  // The server already filters to active+set rows, so every entry here is valid
  const priceMap = {}
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return
    const { id, pricing } = result.value

    const prices = pricing
      .map((entry) => {
        const price = entry.basePrice ?? entry.base_price ?? null
        return price != null ? Number(price) : null
      })
      .filter((price) => price !== null && !isNaN(price) && price > 0)

    priceMap[id] = prices.length > 0 ? Math.min(...prices) : null
  })

  return products.map((p) => ({
    ...p,
    // Use the enriched price; fall back to whatever was already on the product (usually null)
    basePrice: priceMap[p.id] ?? p.basePrice ?? null,
  }))
}
