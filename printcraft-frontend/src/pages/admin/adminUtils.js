import { SIZE_LABELS, THICKNESS_LABELS, FRAME_LABELS } from '../../utils/format'

export const ADMIN_ORDER_STATUS_BADGE = {
  PLACED: 'badge-amber',
  CONFIRMED: 'badge-blue',
  MODIFICATION_ALLOWED: 'badge-purple',
  PROCESSING: 'badge-orange',
  SHIPPED: 'badge-purple',
  DELIVERED: 'badge-green',
}

export const DELIVERY_STATUSES = [
  'CREATED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
  'DELIVERY_ATTEMPTED', 'DELIVERED', 'FAILED_FINAL', 'RTO_INITIATED',
]

export function isProductActive(product) {
  return product.productActive ?? product.isProductActive ?? false
}

export function parseRequestedChanges(jsonStr) {
  if (!jsonStr) return []
  try {
    const payload = JSON.parse(jsonStr)
    const lines = []
    const fields = [
      { key: 'size', label: 'Size', labels: SIZE_LABELS },
      { key: 'frame', label: 'Frame', labels: FRAME_LABELS },
      { key: 'thickness', label: 'Thickness', labels: THICKNESS_LABELS },
    ]
    fields.forEach(({ key, label, labels }) => {
      const change = payload[key]
      if (change?.newValue != null) {
        const oldV = labels[change.oldValue] || change.oldValue
        const newV = labels[change.newValue] || change.newValue
        lines.push(`${label}: ${oldV} → ${newV}`)
      }
    })
    return lines
  } catch {
    return []
  }
}

export function confirmAction(message) {
  return window.confirm(message)
}
