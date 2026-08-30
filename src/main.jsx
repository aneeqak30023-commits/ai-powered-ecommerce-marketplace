import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import { AIAssistantProvider } from './context/AIAssistantContext.jsx'
import { ReviewProvider } from './context/ReviewContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.DEV ? '/' : '/ai-powered-ecommerce-marketplace'}>
      <CartProvider>
        <OrderProvider>
          <AIAssistantProvider>
            <ReviewProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </ReviewProvider>
          </AIAssistantProvider>
        </OrderProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
