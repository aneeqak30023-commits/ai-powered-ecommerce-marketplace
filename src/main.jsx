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
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { InventoryProvider } from './context/InventoryContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.DEV ? '/' : '/ai-powered-ecommerce-marketplace'}>
      <AuthProvider>
        <InventoryProvider>
          <CartProvider>
            <OrderProvider>
              <AIAssistantProvider>
                <ReviewProvider>
                  <WishlistProvider>
                    <RecentlyViewedProvider>
                      <App />
                    </RecentlyViewedProvider>
                  </WishlistProvider>
                </ReviewProvider>
              </AIAssistantProvider>
            </OrderProvider>
          </CartProvider>
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
