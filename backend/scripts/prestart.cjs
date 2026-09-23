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

  // Print the full error output so the actual Prisma/PostgreSQL error is visible in logs
  console.error('[prestart] Migration deploy failed. Error output:')
  console.error(errOutput)

  if (errOutput.includes('P3009') || errOutput.includes('failed migrations')) {
    console.log('[prestart] Detected failed migration (P3009). Resolving...')

    // Extract the actual failed migration name from the error message
    // Format: The `<migration_name>` migration started at ... failed
    const match = errOutput.match(/The `([^`]+)` migration/)
    const failedMigration = match ? match[1] : null

    if (failedMigration) {
      console.log(`[prestart] Failed migration identified: ${failedMigration}`)
      console.log(`[prestart] Marking ${failedMigration} as rolled-back so it can be retried...`)
      try {
        execSync(`npx prisma migrate resolve --rolled-back ${failedMigration}`, { stdio: 'inherit' })
      } catch (resolveError) {
        const resolveErr = (resolveError.stderr ? resolveError.stderr.toString() : '') +
                            (resolveError.stdout ? resolveError.stdout.toString() : '')
        console.log(`[prestart] Could not resolve ${failedMigration}: ${resolveErr}`)
      }
    } else {
      console.log('[prestart] Could not identify failed migration name from error output')
    }

    // Restore init migration to "applied" if a previous buggy run incorrectly marked it as "rolled_back"
    console.log('[prestart] Ensuring init migration is in correct state...')
    try {
      execSync('npx prisma migrate resolve --applied 20260101000000_postgres_init', { stdio: 'inherit' })
    } catch (restoreError) {
      // Init migration may already be "applied" — that is fine
    }

    console.log('[prestart] Retrying deployment...')
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('[prestart] Migrations deployed successfully')
    } catch (retryError) {
      const retryErr = (retryError.stderr ? retryError.stderr.toString() : '') +
                       (retryError.stdout ? retryError.stdout.toString() : '')
      console.error('[prestart] Migration deploy failed on retry:')
      console.error(retryErr)
      throw retryError
    }
  } else {
    throw deployError
  }
}

console.log('[prestart] Skipping automatic production seed to preserve existing database data.')

console.log('[prestart] Production setup complete')
