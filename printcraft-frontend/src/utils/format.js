export const formatINR = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const SIZE_LABELS = {
  SIZE_8X12:  '8×12"',
  SIZE_12X18: '12×18"',
  SIZE_17X24: '17×24"',
  SIZE_19X28: '19×28"',
  SIZE_20X30: '20×30"',
  SIZE_24X36: '24×36"',
  SIZE_36X48: '36×48"',
}

export const THICKNESS_LABELS = {
  MM_3: '3mm',
  MM_5: '5mm',
  MM_8: '8mm',
}

export const FRAME_LABELS = {
  PORTRAIT:  'Portrait',
  LANDSCAPE: 'Landscape',
  CIRCULAR:  'Circular',
  FLOATING:  'Floating',
  POSTER:    'Poster',
  BORDERED:  'Bordered',
}

export const CATEGORY_LABELS = {
  TILES:       'Tiles',
  PVC:         'PVC',
  GLASS:       'Glass',
  METAL:       'Metal',
  WOOD:        'Wood',
  ACRYLIC:     'Acrylic',
  PHOTO_FRAME: 'Photo Frame',
  POSTER:      'Poster',
  CREATIVE:    'Creative',
}

export const CATEGORY_ICONS = {
  TILES:       '🪟',
  PVC:         '🪪',
  GLASS:       '🔮',
  METAL:       '⚙️',
  WOOD:        '🪵',
  ACRYLIC:     '💎',
  PHOTO_FRAME: '🖼️',
  POSTER:      '📋',
  CREATIVE:    '🎨',
}

export const ORDER_STATUS_BADGE = {
  PLACED:     'badge-amber',
  CONFIRMED:  'badge-blue',
  PROCESSING: 'badge-orange',
  SHIPPED:    'badge-purple',
  DELIVERED:  'badge-green',
}

export const PAYMENT_STATUS_BADGE = {
  PENDING: 'badge-amber',
  PAID:    'badge-green',
  FAILED:  'badge-red',
}

export const DELIVERY_STATUS_LABELS = {
  CREATED: 'Order Created',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERY_ATTEMPTED: 'Delivery Attempted',
  DELIVERED: 'Delivered',
  FAILED_FINAL: 'Delivery Failed',
  RTO_INITIATED: 'Returning to Origin',
}

export const DELIVERY_STATUS_BADGE = {
  CREATED: 'badge-grey',
  PACKED: 'badge-blue',
  SHIPPED: 'badge-purple',
  IN_TRANSIT: 'badge-indigo',
  OUT_FOR_DELIVERY: 'badge-orange',
  DELIVERY_ATTEMPTED: 'badge-amber',
  DELIVERED: 'badge-green',
  FAILED_FINAL: 'badge-red',
  RTO_INITIATED: 'badge-red',
}

// Preview pixel dimensions for frame preview
export const SIZE_PREVIEW_DIMS = {
  SIZE_8X12:  { w: 120, h: 180 },
  SIZE_12X18: { w: 160, h: 240 },
  SIZE_17X24: { w: 200, h: 283 },
  SIZE_19X28: { w: 190, h: 280 },
  SIZE_20X30: { w: 220, h: 330 },
  SIZE_24X36: { w: 250, h: 375 },
  SIZE_36X48: { w: 300, h: 400 },
}

export const THICKNESS_BORDER = {
  MM_3: 6,
  MM_5: 10,
  MM_8: 16,
}

export const ALL_SIZES       = Object.keys(SIZE_LABELS)
export const ALL_THICKNESSES = Object.keys(THICKNESS_LABELS)
export const ALL_FRAMES      = Object.keys(FRAME_LABELS)
export const ALL_CATEGORIES  = Object.keys(CATEGORY_LABELS)

export function getNameFromToken() {
  const token = localStorage.getItem('printcraft_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.name || null
  } catch { return null }
}
