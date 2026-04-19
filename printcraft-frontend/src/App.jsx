import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AnnouncementBar from './components/AnnouncementBar'
import Navbar         from './components/Navbar'
import CartDrawer     from './components/CartDrawer'
import Footer         from './components/Footer'

import HomePage      from './pages/HomePage'
import ProductsPage  from './pages/ProductsPage'
import ProductPage   from './pages/ProductPage'
import RegisterPage  from './pages/RegisterPage'
import LoginPage     from './pages/LoginPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import CheckoutPage  from './pages/CheckoutPage'
import AccountPage   from './pages/AccountPage'
import AboutPage     from './pages/AboutPage'
import ContactPage   from './pages/ContactPage'
import AdminPage     from './pages/AdminPage'
import NotFoundPage  from './pages/NotFoundPage'

function Layout({ children, noFooter }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { style: { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' } },
          error:   { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' } },
        }}
      />

      <Routes>
        {/* Public routes with full layout */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductPage /></Layout>} />
        <Route path="/about"   element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

        {/* Auth — no footer */}
        <Route path="/register"   element={<Layout noFooter><RegisterPage /></Layout>} />
        <Route path="/login"      element={<Layout noFooter><LoginPage /></Layout>} />
        <Route path="/verify-otp" element={<Layout noFooter><VerifyOtpPage /></Layout>} />

        {/* Protected */}
        <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
        <Route path="/account"  element={<Layout><AccountPage /></Layout>} />

        {/* Admin — nested routes, no footer */}
        <Route path="/admin/*" element={<Layout noFooter><AdminPage /></Layout>} />

        {/* 404 */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
