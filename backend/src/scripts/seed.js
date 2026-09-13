import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

function loadJson(relativePath) {
  const absolutePath = join(__dirname, '..', '..', '..', relativePath)
  return JSON.parse(readFileSync(absolutePath, 'utf8'))
}

async function main() {
  const categories = loadJson('src/data/categories.json')
  const products = loadJson('src/data/products.json')

  // Clear existing data in dependency-safe order
  await prisma.wishlist.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Seed categories preserving original IDs
  for (const category of categories) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.id,
        description: category.description || null,
        icon: category.icon || null,
        productCount: category.productCount || 0,
        subcategories: category.subcategories ? JSON.stringify(category.subcategories) : null,
      },
    })
  }

  // Seed products preserving original numeric IDs
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        categoryId: product.categoryId,
        brand: product.brand || null,
        rating: product.rating ?? 0,
        reviewCount: product.reviewCount ?? 0,
        image: product.image || null,
        images: product.images ? JSON.stringify(product.images) : null,
        tags: product.tags ? JSON.stringify(product.tags) : null,
        specifications: product.specifications ? JSON.stringify(product.specifications) : null,
        stock: product.stock ?? 0,
        subcategory: product.subcategory || null,
      },
    })
  }

  // Seed inventory records preserving product stock values
  for (const product of products) {
    await prisma.inventory.create({
      data: {
        productId: product.id,
        stock: product.stock ?? 0,
        lowStockThreshold: 5,
      },
    })
  }

  const productCount = await prisma.product.count()
  const categoryCount = await prisma.category.count()
  const inventoryCount = await prisma.inventory.count()
  console.log(`Seeded ${categoryCount} categories, ${productCount} products, and ${inventoryCount} inventory records`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
