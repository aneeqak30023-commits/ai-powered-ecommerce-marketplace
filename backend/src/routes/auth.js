import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

const JWT_SECRET = env.jwtSecret
const JWT_EXPIRY = '7d'

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const trimmedEmail = String(email).trim().toLowerCase()
    const trimmedName = String(name).trim()

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const salt = 'bcrypt'

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        passwordHash,
        salt,
      },
    })

    const token = generateToken(user.id)
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
      createdAt: new Date().toISOString(),
    }

    res.status(201).json({
      success: true,
      user: serializeUser(user),
      session,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to register', message: safeError(error) })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const trimmedEmail = String(email).trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user.id)
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
      createdAt: new Date().toISOString(),
    }

    res.json({
      success: true,
      user: serializeUser(user),
      session,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', message: safeError(error) })
  }
})

router.post('/logout', async (req, res) => {
  res.json({ success: true })
})

router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No session provided' })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate session', message: safeError(error) })
  }
})

export default router