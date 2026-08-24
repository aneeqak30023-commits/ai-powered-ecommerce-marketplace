import { useLocation, Link } from 'react-router-dom'
import OrderConfirmation from '../components/checkout/OrderConfirmation'
import { useOrders } from '../context/OrderContext'

export default function ConfirmationPage() {
  const location = useLocation()
  const { orders } = useOrders()
  const order = location.state?.order

  if (!order) {
    const orderId = location.state?.orderId
    const foundOrder = orders.find(o => o.id === orderId)
    if (!foundOrder) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#0F172A] mb-4">No Order Found</h1>
            <p className="text-[#475569] mb-6">We could not find an order with that ID.</p>
            <Link
              to="/products"
              className="inline-block bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <OrderConfirmation order={foundOrder} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <OrderConfirmation order={order} />
      </div>
    </div>
  )
}
