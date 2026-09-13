import express from 'express'
import { PrismaClient } from '@prisma/client'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function serializeInventory(inventory) {
  return {
    productId: inventory.productId,
    stock: inventory.stock,
    lowStockThreshold: inventory.lowStockThreshold,
    updatedAt: inventory.updatedAt,
  }
}

router.get('/', async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            categoryId: true,
          }
        }
      },
      orderBy: { productId: 'asc' },
    })

    res.json(inventories.map(inv => ({
      ...serializeInventory(inv),
      product: inv.product
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory', message: safeError(error) })
  }
})

router.get('/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'Inventory not found' })
    }

    const inventory = await prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            categoryId: true
          }
        }
      },
    })

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' })
    }

    res.json({
      ...serializeInventory(inventory),
      product: inventory.product
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory', message: safeError(error) })
  }
})

export default router