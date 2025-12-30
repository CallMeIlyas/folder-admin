import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useCallback } from "react"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import OurProducts from "./pages/OurProducts"
import SizeGuide from "./pages/SizeGuide"
import Location from "./pages/Location"
import BackgroundCatalog from "./pages/BackgroundCatalog"
import Faq from "./pages/Faq"
import TermsOfService from "./pages/TermsOfService"
import ContactUs from "./pages/ContactUs"
import ShoppingCart from "./pages/ShoppingCart"
import ProductDetail from "./pages/ProductDetail"
import { CartProvider } from "./context/CartContext"
import PageTransition from "./utils/PageTransition"
import SlideUpTransition from "./utils/SlideUpTransition"
import SmoothScrollProvider from "./utils/SmoothScrollProvider"

// Import admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ImageManagerPage from "./pages/admin/ImageManagerPage"
import TextEditorPage from "./pages/admin/TextEditorPage"
import VideoManagerPage from "./pages/admin/VideoManagerPage"
import InvoiceManagerPage from "./pages/admin/InvoiceManagerPage"
import ProductManagerPage from "./pages/admin/ProductManagerPage"
import PageManagerPage from "./pages/admin/PageManagerPage"
// Import ProductDetailPage untuk admin (edit produk)
import ProductDetailPage from "./pages/admin/detail/ProductDetailPage"

// Import AuthGuard dan AdminLayout
import AuthGuard from "./components/admin/auth/AuthGuard"
import AdminLayout from "./components/admin/layout/AdminLayout"

const App = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            element={
              <PageTransition>
                <SmoothScrollProvider>
                  <Layout onSearch={handleSearch} />
                </SmoothScrollProvider>
              </PageTransition>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<Location />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/shoppingcart" element={<ShoppingCart />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            <Route
              path="/size-guide"
              element={
                <SlideUpTransition>
                  <SizeGuide />
                </SlideUpTransition>
              }
            />

            <Route
              path="/products"
              element={
                <SlideUpTransition>
                  <OurProducts />
                </SlideUpTransition>
              }
            />

            <Route
              path="/background-catalog"
              element={
                <SlideUpTransition>
                  <BackgroundCatalog searchQuery={searchQuery} />
                </SlideUpTransition>
              }
            />
          </Route>

          {/* Admin Login (Public route) */}
          <Route 
            path="/admin/login" 
            element={
              <PageTransition>
                <AdminLoginPage />
              </PageTransition>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            {/* Default redirect ke dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Content Management */}
            <Route path="images" element={<ImageManagerPage />} />
            <Route path="text" element={<TextEditorPage />} />
            <Route path="videos" element={<VideoManagerPage />} />
            
            {/* Invoice Management */}
            <Route path="invoice" element={<InvoiceManagerPage />} />
            
            {/* Page Management */}
            <Route path="pagemanager" element={<PageManagerPage />} />
            
            {/* Product Management */}
            <Route path="product" element={<ProductManagerPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
          </Route>

          {/* Redirect untuk admin yang tidak login - arahkan ke login */}
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App