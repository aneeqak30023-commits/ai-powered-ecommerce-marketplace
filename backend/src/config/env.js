import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-in-production',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}

export function validateEnv() {
  const missing = []
  if (!env.databaseUrl) missing.push('DATABASE_URL')
  if (env.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET')
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
