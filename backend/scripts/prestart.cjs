const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

if (process.env.NODE_ENV !== 'production') {
  console.log('[prestart] Skipping PostgreSQL schema swap (development mode)')
  process.exit(0)
}

const prismaDir = path.join(process.cwd(), 'prisma')
const schemaProd = path.join(prismaDir, 'schema.production.prisma')
const schema = path.join(prismaDir, 'schema.prisma')
const migrationsDir = path.join(prismaDir, 'migrations')
const migrationsProdDir = path.join(prismaDir, 'migrations-postgres')
const migrationLock = path.join(migrationsDir, 'migration_lock.toml')

console.log('[prestart] Swapping Prisma schema to PostgreSQL for production...')

fs.cpSync(schemaProd, schema, { force: true })

if (fs.existsSync(migrationsProdDir)) {
  if (fs.existsSync(migrationsDir)) {
    fs.rmSync(migrationsDir, { recursive: true, force: true })
  }
  fs.cpSync(migrationsProdDir, migrationsDir, { recursive: true })
}

fs.mkdirSync(migrationsDir, { recursive: true })
fs.writeFileSync(migrationLock, 'provider = "postgresql"\n')

console.log('[prestart] Prisma client configuration for PostgreSQL complete')
execSync('npx prisma generate', { stdio: 'inherit' })

console.log('[prestart] Deploying migrations...')
execSync('npx prisma migrate deploy', { stdio: 'inherit' })
console.log('[prestart] Production setup complete')
