import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
    base: isDev ? '/' : (process.env.VERCEL ? '/' : '/ai-powered-ecommerce-marketplace/'),
    plugins: [react(), tailwindcss()],
  }
})
