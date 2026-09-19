import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import WishlistPage from './pages/WishlistPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountPage from './pages/AccountPage'
import PaymentReturnPage from './pages/PaymentReturnPage'
import NotFoundPage from './pages/NotFoundPage'
import AIChat from './components/ai/AIChat'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import AdminRoute from './components/admin/AdminRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'
import AdminReviews from './pages/admin/AdminReviews.jsx'
import AdminSupport from './pages/admin/AdminSupport.jsx'
import AdminInventory from './pages/admin/AdminInventory.jsx'
import AdminPayments from './pages/admin/AdminPayments.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/payment/return" element={<PaymentReturnPage />} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AIChat />
    </Layout>
  )
}
