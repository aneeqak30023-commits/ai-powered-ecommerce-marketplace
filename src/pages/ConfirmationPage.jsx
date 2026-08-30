import { useLocation, Link } from 'react-router-dom'
import OrderConfirmation from '../components/checkout/OrderConfirmation'
import { useOrders } from '../context/OrderContext'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#0F172A',
  textSecondary: '#475569',
  background: '#F8FAFC'
}

export default function ConfirmationPage() {
  const location = useLocation()
  const { orders } = useOrders()
  const order = location.state?.order

  if (!order) {
    const orderId = location.state?.orderId
    const foundOrder = orders.find(o => o.id === orderId)
    if (!foundOrder) {
      return (
        <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, margin: '0 0 16px' }}>No Order Found</h1>
            <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 24px' }}>We could not find an order with that ID.</p>
            <Link
              to="/products"
              style={{ display: 'inline-block', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )
    }
    return (
      <div style={{ minHeight: '100vh', background: C.background }}>
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <OrderConfirmation order={foundOrder} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <OrderConfirmation order={order} />
      </div>
    </div>
  )
}
