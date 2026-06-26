import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import api from './api/axios'
import { isAdmin, isLoggedIn } from './utils/jwt'

import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Spinner from './components/Spinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TrackingPage = lazy(() => import('./pages/TrackingPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))

function WhatsAppFAB() {
  const location = useLocation()
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState(null)
  const token = localStorage.getItem('printcraft_token')

  useEffect(() => {
    const hiddenPaths = ['/', '/login', '/register', '/verify-otp',
      '/about', '/contact', '/track']
    const isAdminPage = location.pathname.startsWith('/admin')
    const isHiddenPath = hiddenPaths.includes(location.pathname)
    const isProductsPage = location.pathname === '/products'

    if (!token || isHiddenPath || isAdminPage || isProductsPage) {
      setShowWhatsApp(false)
      return
    }

    // Check if user has any CONFIRMED or MODIFICATION_ALLOWED orders
    const checkOrders = async () => {
      try {
        const res = await api.get('/api/user/orders')
        const orders = res.data
        const activeOrder = orders.find(o =>
          o.orderStatus === 'CONFIRMED' ||
          o.orderStatus === 'MODIFICATION_ALLOWED' ||
          o.orderStatus === 'PROCESSING'
        )
        if (activeOrder) {
          setShowWhatsApp(true)
          setActiveOrderId(activeOrder.id)
        } else {
          setShowWhatsApp(false)
          setActiveOrderId(null)
        }
      } catch {
        setShowWhatsApp(false)
      }
    }

    checkOrders()
  }, [location.pathname, token])

  if (!showWhatsApp) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 8,
    }}>
      {/* Tooltip label */}
      <div className="wa-tooltip" style={{
        background: '#1A1A1A',
        color: 'white',
        fontSize: 12,
        fontWeight: 500,
        padding: '6px 12px',
        borderRadius: 8,
        whiteSpace: 'nowrap',
        opacity: 0,
        transform: 'translateY(4px)',
        transition: 'all 0.2s ease',
        pointerEvents: 'none',
      }}>
        Request Customisation
      </div>

      {/* Main button */}
      <a
        href={`https://wa.me/919999999999?text=ORDER_ID:${activeOrderId}%0ASIZE:%0AFRAME:%0ATHICKNESS:`}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-fab"
        title="Request Customisation via WhatsApp"
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.15)',
          animation: 'waBounce 2.5s ease-in-out infinite',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.55), 0 3px 12px rgba(0,0,0,0.2)'
          e.currentTarget.previousElementSibling.style.opacity = '1'
          e.currentTarget.previousElementSibling.style.transform = 'translateY(0)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.15)'
          e.currentTarget.previousElementSibling.style.opacity = '0'
          e.currentTarget.previousElementSibling.style.transform = 'translateY(4px)'
        }}
      >
        <svg viewBox="0 0 24 24" fill="white" width="30" height="30">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Pulse ring animation */}
      <div style={{
        position: 'absolute',
        bottom: 0, right: 0,
        width: 60, height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(37,211,102,0.5)',
        animation: 'waPulse 2.5s ease-out infinite',
        pointerEvents: 'none',
        zIndex: -1
      }} />
    </div>
  )
}

function Layout({ children, noFooter, heroPage }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      {/* Fixed navbar is 64px tall; hero pages intentionally bleed under it */}
      <main style={heroPage ? undefined : { paddingTop: 64 }}>{children}</main>
      {!noFooter && <Footer />}
    </>
  )
}

function AdminRouteGuard({ children }) {
  if (!isLoggedIn() || !isAdmin()) return <Navigate to="/admin/login" replace />
  return children
}

function PageLoader() {
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner center />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500' },
          success: { style: { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' } },
          error: { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' } },
        }}
      />

      <WhatsAppFAB />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout heroPage><HomePage /></Layout>} />
          <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/track" element={<Layout><TrackingPage /></Layout>} />

          <Route path="/register" element={<Layout noFooter><RegisterPage /></Layout>} />
          <Route path="/login" element={<Layout noFooter><LoginPage /></Layout>} />
          <Route path="/verify-otp" element={<Layout noFooter><VerifyOtpPage /></Layout>} />

          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/account" element={<Layout><AccountPage /></Layout>} />
          <Route path="/order-success" element={<Layout noFooter><OrderSuccessPage /></Layout>} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={
            <AdminRouteGuard>
              <AdminPage />
            </AdminRouteGuard>
          } />

          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
