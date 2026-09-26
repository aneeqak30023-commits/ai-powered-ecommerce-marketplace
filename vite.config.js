import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL ||
    (isDev ? 'http://localhost:3001' : 'https://nexmart-backend-production.up.railway.app')
  return {
    base: isDev ? '/' : (process.env.VERCEL ? '/' : '/ai-powered-ecommerce-marketplace/'),
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
    },
    plugins: [react(), tailwindcss()],
  }
})
