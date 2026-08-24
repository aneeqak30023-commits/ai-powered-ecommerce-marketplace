import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/checkout/CheckoutForm'
import { useCart } from '../context/CartContext'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems } = useCart()

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [cartItems, navigate])

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Checkout</h1>
        <CheckoutForm
          onOrderComplete={(orderId) => navigate('/confirmation', { state: { orderId } })}
        />
      </div>
    </div>
  )
}
