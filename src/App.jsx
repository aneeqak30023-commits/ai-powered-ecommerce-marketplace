import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import WishlistPage from './pages/WishlistPage'
import NotFoundPage from './pages/NotFoundPage'
import AIChat from './components/ai/AIChat'
import CartDrawer from './components/cart/CartDrawer'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AIChat />
      <CartDrawer />
    </Layout>
  )
}
