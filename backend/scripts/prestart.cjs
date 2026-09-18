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
try {
  const deployOutput = execSync('npx prisma migrate deploy', { encoding: 'utf8' })
  if (deployOutput) process.stdout.write(deployOutput)
  console.log('[prestart] Migrations deployed successfully')
} catch (deployError) {
  const errOutput = (deployError.stderr ? deployError.stderr.toString() : '') +
                    (deployError.stdout ? deployError.stdout.toString() : '')
  if (errOutput.includes('P3009') || errOutput.includes('failed migrations')) {
    console.log('[prestart] Detected failed migration (P3009). Resolving as rolled-back...')
    execSync('npx prisma migrate resolve --rolled-back 20260101000000_postgres_init', { stdio: 'inherit' })
    console.log('[prestart] Migration resolved as rolled-back. Retrying deployment...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('[prestart] Migrations deployed successfully')
  } else {
    throw deployError
  }
}

console.log('[prestart] Skipping automatic production seed to preserve existing database data.')

console.log('[prestart] Production setup complete')
