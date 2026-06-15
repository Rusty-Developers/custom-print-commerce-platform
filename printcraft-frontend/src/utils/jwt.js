/**
 * Decodes a JWT token without any library.
 * Returns the payload object or null if invalid.
 */
export function decodeToken(token) {
  try {
    const base64 = token.split('.')[1]
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      base64.length + (4 - (base64.length % 4)) % 4,
      '='
    )
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function getTokenPayload() {
  const token = localStorage.getItem('printcraft_token')
  if (!token) return null
  return decodeToken(token)
}

export function getRole() {
  const payload = getTokenPayload()
  return payload?.role || null
}

export function getPhone() {
  const payload = getTokenPayload()
  return payload?.sub || null
}

export function isAdmin() {
  return getRole() === 'ROLE_ADMIN' || getRole() === 'ADMIN'
}

export function isLoggedIn() {
  const token = localStorage.getItem('printcraft_token')
  if (!token) return false
  const payload = decodeToken(token)
  if (!payload) return false
  // Check expiry
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem('printcraft_token')
    return false
  }
  return true
}

export function getName() {
  const payload = getTokenPayload()
  return payload?.name || null
}
