import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nexmart-backend',
  })
})

export default router
