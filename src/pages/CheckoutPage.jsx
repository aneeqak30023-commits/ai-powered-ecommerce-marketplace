import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/checkout/CheckoutForm'
import { useCart } from '../context/CartContext'

const C = {
  primary: '#6366F1',
  text: '#0F172A',
  textSecondary: '#475569',
  background: '#F8FAFC'
}

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
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 32px' }}>Checkout</h1>
        <CheckoutForm
          onOrderComplete={(orderId) => navigate('/confirmation', { state: { orderId } })}
        />
      </div>
    </div>
  )
}
