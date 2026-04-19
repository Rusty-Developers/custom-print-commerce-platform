export const formatINR = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const SIZE_LABELS = {
  SIZE_8X12:  '8×12"',
  SIZE_12X18: '12×18"',
  SIZE_17X24: '17×24"',
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

// Preview pixel dimensions for frame preview
export const SIZE_PREVIEW_DIMS = {
  SIZE_8X12:  { w: 120, h: 180 },
  SIZE_12X18: { w: 160, h: 240 },
  SIZE_17X24: { w: 200, h: 283 },
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
