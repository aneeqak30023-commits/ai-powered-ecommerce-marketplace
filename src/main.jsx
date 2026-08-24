import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import { AIAssistantProvider } from './context/AIAssistantContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <OrderProvider>
          <AIAssistantProvider>
            <App />
          </AIAssistantProvider>
        </OrderProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
