import { create } from 'zustand'

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────
  token: localStorage.getItem('printcraft_token') || null,
  setToken: (token) => {
    localStorage.setItem('printcraft_token', token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem('printcraft_token')
    set({ token: null })
  },

  // ── Cart ──────────────────────────────────────────
  cart: [],
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
    if (existing >= 0) {
      const updated = [...state.cart]
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + item.quantity }
      return { cart: updated }
    }
    return { cart: [...state.cart, item] }
  }),

  removeFromCart: (index) => set((state) => ({
    cart: state.cart.filter((_, i) => i !== index),
  })),

  updateQty: (index, qty) => set((state) => {
    if (qty < 1) return state
    const updated = [...state.cart]
    updated[index] = { ...updated[index], quantity: qty }
    return { cart: updated }
  }),

  clearCart: () => set({ cart: [] }),

  // Derived
  cartCount: () => get().cart.reduce((acc, item) => acc + item.quantity, 0),
  cartTotal: () => get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
}))

export default useStore
