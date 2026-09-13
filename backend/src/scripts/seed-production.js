import { seedDatabase } from '../_seed-helper.js'

async function main() {
  await seedDatabase()
  console.log('Production database seeded successfully')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
