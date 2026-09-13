# Step 16A - Production Deployment Preparation Checklist

## Files Modified

### Environment Configuration
| File | Change |
|------|--------|
| `.env.example` (root) | Added `VITE_BACKEND_URL` placeholder and documentation for dev vs production |
| `backend/.env.example` | Added `DATABASE_URL`, `PORT`, `NODE_ENV`, `CLIENT_ORIGIN`, `PRISMA_ENGINE_TYPE` variables; updated `JWT_SECRET` placeholder message |
| `backend/src/config/env.js` | Added `clientOrigin` export; changed `jwtSecret` fallback to `'dev-only-insecure-secret-change-in-production'` for dev; fixed `validateEnv()` to check `process.env.JWT_SECRET` directly in production (not the fallback) |

### JWT Security
| File | Change |
|------|--------|
| `backend/src/middleware/auth.js` | Removed hardcoded `JWT_SECRET` fallback (`'nexmart-jwt-secret-change-in-production'`); now imports from `env.js` |
| `backend/src/routes/auth.js` | Removed hardcoded `JWT_SECRET` fallback; now imports from `env.js` |

### Seed Security
| File | Change |
|------|--------|
| `backend/src/_seed-helper.js` | Added `bcrypt` import; added `hashPassword()` helper using `bcryptjs` (salt rounds: 10); all seeded users (demo + admin) now get bcrypt-hashed passwords instead of plaintext strings |

### Frontend Build
| File | Change |
|------|--------|
| `package.json` | Fixed `postbuild` script from CommonJS `require('fs')` to ESM-compatible `import('fs').then(...)` for GitHub Pages 404.html copy |

### Git Configuration
| File | Change |
|------|--------|
| `.gitignore` (root) | Added `test-results/` and `test-search.mjs` to ignored patterns |
| `backend/.gitignore` | Added `test-results/`, `coverage/`, `.env.production`, `prisma/*.db`, `prisma/*.db-journal` |

### Prisma / Database
| File | Change |
|------|--------|
| `backend/prisma/schema.production.prisma` | **New file**: Complete PostgreSQL schema mirroring current SQLite schema models, fields, relations, and constraints |
| `backend/prisma/migrations/20260101000000_postgres_init/migration.sql` | **New file**: Clean PostgreSQL migration based on current schema (not edited from old SQLite migrations) |

### GitHub Actions
| File | Change |
|------|--------|
| `.github/workflows/deploy.yml` | Added `VITE_BACKEND_URL: ${{ vars.BACKEND_API_URL || 'http://localhost:3001' }}` to Build step; added dependencies caching step |

### Cleanup
| File | Action |
|------|--------|
| `backend/src/temp-check.js` | Deleted (was debug/temp file) |
| `backend/debug-product.js` | Deleted (was debug file) |
| `src/context/InventoryContext.test.jsx.original` | Deleted (backup file) |
| `test-results/` | Deleted and added to `.gitignore` |
| `test-search.mjs` | Deleted and added to `.gitignore` |

## Deployment Blockers Resolved

1. **Backend not in git** → All 48 backend source files, tests, migrations, and schemas are ready to be committed
2. **Plaintext seed passwords** → All seeded users now use bcrypt hashing (10 salt rounds)
3. **Insecure JWT secret fallback** → Removed hardcoded fallback; now reads from `env.js`; `validateEnv()` throws in production if `JWT_SECRET` is not set via environment variable
4. **Missing CLIENT_ORIGIN in backend env** → Added to `backend/.env.example` and `env.js` config
5. **Postbuild script ESM incompatibility** → Fixed from `require('fs')` to `import('fs')` dynamic import
6. **No VITE_BACKEND_URL in CI/CD** → GitHub Actions workflow now reads from GitHub Actions `vars` with localhost fallback
7. **Migrations out of sync with schema** → Created clean PostgreSQL migration based on current schema
8. **Unprepared test artifacts in git** → Cleaned up temp files, added patterns to `.gitignore`

## Blockers Still Remaining

1. **SQLite for development** → `schema.prisma` still uses SQLite; production schema is in separate `schema.production.prisma` (requires manual swap for production deploy)
2. **Safepay credential issue** → SDK returns `merchant_api_key: invalid token pattern` error (acknowledged, not modified per constraints)
3. **Backend not committed to git** → Files are prepared and staged for commit but NOT yet committed (per "do not deploy" constraint)
4. **No automated PostgreSQL migration** → Requires manual `DATABASE_URL` set to PostgreSQL connection string before running `prisma migrate deploy`
5. **JWT_SECRET not generated for production** → Must be provided by deployment environment (not hardcoded, per constraints)

## Test Results

| Test Suite | Result |
|------------|--------|
| Backend Tests | 134 passed, 0 failed (full suite via `npm test`) |
| Frontend Tests | 1031 passed, 0 failed (73 test files via `npm test`) |
| Lint (oxlint) | Passed with 0 errors, ~65 warnings (pre-existing) |
| Frontend Production Build | Passed — 671 modules transformed, dist output generated + 404.html created |
| Prisma Schema Validation | Passed — "The schema at prisma/schema.prisma is valid 🚀" |
| Prisma Generate | Passed — client generated successfully (v6.19.3) |

## Security Verification

- **Safepay Step 11B not modified** → Confirmed: `backend/src/services/safepay.js` and `backend/src/routes/payments.js` have no changes
- **No credentials committed** → Verified: no `.env`, `.env.*` files (except `.env.example` with placeholders) are staged
- **No database files committed** → Verified: `backend/prisma/dev.db`, `test.db` all gitignored
- **No secrets in build output** → Verified: searched `dist/assets/*.js` for `sec_`, `change_me`, `admin123` — no matches
- **Existing security preserved** → Helmet, CORS (`CLIENT_ORIGIN` whitelist), rate limiting, `express.json({ limit: '100kb' })`, `safeError`/`safeErrorResponse` all intact
