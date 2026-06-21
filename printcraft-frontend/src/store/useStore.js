import { create } from 'zustand'

function loadCart() {
  try {
    const saved = localStorage.getItem('printcraft_cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem('printcraft_cart', JSON.stringify(cart))
  } catch {
    /* storage full — silently ignore */
  }
}

const useStore = create((set, get) => ({
  token: localStorage.getItem('printcraft_token') || null,
  setToken: (token) => {
    localStorage.setItem('printcraft_token', token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem('printcraft_token')
    set({ token: null })
  },

  // NOTE: Profile picture is stored locally only — no backend user profile
  // update endpoint exists. This is intentional for the current scope.
  profilePic: localStorage.getItem('printcraft_profile_pic') || null,
  setProfilePic: (url) => {
    localStorage.setItem('printcraft_profile_pic', url)
    set({ profilePic: url })
  },

  cart: loadCart(),
  cartOpen: false,
  setCartOpen: (val) => set({ cartOpen: val }),

  addToCart: (item) => set((state) => {
    const existing = state.cart.findIndex(
      (c) =>
        c.productId === item.productId &&
        c.selectedSize === item.selectedSize &&
        c.selectedThickness === item.selectedThickness &&
        c.selectedFrame === item.selectedFrame
    )
    let cart
    if (existing >= 0) {
      cart = [...state.cart]
      cart[existing] = { ...cart[existing], quantity: cart[existing].quantity + item.quantity }
    } else {
      cart = [...state.cart, item]
    }
    saveCart(cart)
    return { cart }
  }),

  removeFromCart: (index) => set((state) => {
    const cart = state.cart.filter((_, i) => i !== index)
    saveCart(cart)
    return { cart }
  }),

  updateQty: (index, qty) => set((state) => {
    if (qty < 1) return state
    const cart = [...state.cart]
    cart[index] = { ...cart[index], quantity: qty }
    saveCart(cart)
    return { cart }
  }),

  clearCart: () => {
    saveCart([])
    set({ cart: [] })
  },

  cartCount: () => get().cart.reduce((acc, item) => acc + item.quantity, 0),
  cartTotal: () => get().cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
}))

export default useStore
