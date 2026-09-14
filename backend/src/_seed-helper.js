import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

function loadJson(relativePath) {
  const absolutePath = join(__dirname, 'data', relativePath)
  return JSON.parse(readFileSync(absolutePath, 'utf8'))
}

export async function seedDatabase() {
  const categories = loadJson('categories.json')
  const products = loadJson('products.json')
  const reviews = loadJson('reviews.json')
  const knowledgeBase = loadJson('knowledgeBase.json')

  try {
    await prisma.$connect()
    console.log('Seeding: deleting existing data...')
    await prisma.wishlist.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.review.deleteMany()
    await prisma.supportTicketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.knowledgeBase.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    console.log('Seeding: existing data deleted')

    console.log('Seeding: creating categories...')
    for (const category of categories) {
      const created = await prisma.category.create({
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
      console.log(`Created category: ${created.id}`)
    }
    console.log('Seeding: categories created')

    console.log('Seeding: creating products...')
    for (const product of products) {
      try {
        const created = await prisma.product.create({
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
        console.log(`Created product: ${created.id}`)
      } catch (error) {
        console.error(`Failed to create product ${product.id}:`, error.message)
        throw error
      }
    }
    console.log('Seeding: products created')

    console.log('Seeding: creating inventory...')
    for (const product of products) {
      const created = await prisma.inventory.create({
        data: {
          productId: product.id,
          stock: product.stock ?? 0,
          lowStockThreshold: 5,
        },
      })
      console.log(`Created inventory for product: ${created.productId}`)
    }
    console.log('Seeding: inventory created')

    console.log('Seeding: creating demo users...')
    const demoReviewerNames = [
      'Amanda Garcia', 'James Wilson', 'Ryan Lee', 'Stephanie White', 'Kevin Harris',
      'Chris Brown', 'Nicole Robinson', 'Sarah Johnson', 'Jessica Martinez', 'Andrew Wright',
      'Justin Young', 'Ashley Taylor', 'Jason Walker', 'Michael Chen', 'Megan Hall',
      'Rachel Clark', 'Emily Davis', 'Laura King', 'Brian Lewis', 'David Anderson'
    ]

    const nameToUserId = {}
    for (const name of demoReviewerNames) {
      const email = name.toLowerCase().replace(/\s+/g, '.') + '@demo.example.com'
      const user = await prisma.user.upsert({
        where: { email },
        update: { name, passwordHash: await hashPassword('demo123') },
        create: {
          email,
          name,
          passwordHash: await hashPassword('demo123'),
          salt: 'bcrypt',
          role: 'user',
        },
      })
      nameToUserId[name] = user.id
      console.log(`Created demo user: ${user.id} (${name})`)
    }

    const adminEmail = 'admin@nexmart.example.com'
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: 'Admin User',
        passwordHash: await hashPassword('admin123'),
        role: 'admin',
      },
      create: {
        email: adminEmail,
        name: 'Admin User',
        passwordHash: await hashPassword('admin123'),
        salt: 'bcrypt',
        role: 'admin',
      },
    })
    console.log(`Created admin user: ${adminUser.id} (${adminEmail})`)
    console.log('Seeding: demo users created')

    console.log('Seeding: creating reviews...')
    for (const [productIdString, productReviews] of Object.entries(reviews)) {
      const productId = Number(productIdString)
      let created = 0
      for (const review of productReviews) {
        const reviewerName = review.reviewerName || demoReviewerNames[0]
        const userId = nameToUserId[reviewerName] || nameToUserId[demoReviewerNames[0]]
        try {
          await prisma.review.create({
            data: {
              productId,
              userId,
              reviewerName,
              rating: review.rating,
              comment: review.text,
              createdAt: new Date(review.date),
            },
          })
          created++
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`Skipping duplicate review for product ${productId} by ${reviewerName}`)
          } else {
            throw error
          }
        }
      }
      console.log(`Created ${created} reviews for product ${productId}`)
    }
    console.log('Seeding: reviews created')

    console.log('Seeding: creating knowledge base...')
    for (const item of knowledgeBase) {
      await prisma.knowledgeBase.create({
        data: {
          id: item.id,
          category: item.category,
          question: item.question,
          answer: item.answer,
          keywords: item.keywords ? JSON.stringify(item.keywords) : null,
          priority: 1,
        },
      })
    }
    console.log('Seeding: knowledge base created')
  } finally {
    await prisma.$disconnect()
  }
}
