import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'

export default function OrdersPage() {
  const { orders } = useOrders()
  const [expandedOrder, setExpandedOrder] = useState(null)

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (sortedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">No Orders Yet</h1>
          <p className="text-[#475569] mb-6">You haven't placed any orders. Start shopping now!</p>
          <Link
            to="/products"
            className="inline-block bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-8">My Orders</h1>
        <div className="space-y-4">
          {sortedOrders.map(order => (
            <div key={order.id} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0F172A]">Order #{order.id}</p>
                    <p className="text-sm text-[#475569]">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {order.status || 'Confirmed'}
                    </span>
                    <span className="font-semibold text-[#0F172A]">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {expandedOrder === order.id && (
                <div className="border-t border-[#E2E8F0] p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-4">Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-[#0F172A]">{item.name}</p>
                          <p className="text-sm text-[#475569]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-[#0F172A]">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
