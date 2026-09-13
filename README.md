# NexMart — AI-Powered E-Commerce Marketplace

React + Vite frontend with Express + Prisma + SQLite backend foundation.

## Frontend

```bash
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Verify

```bash
# Frontend tests
npm test

# Lint
npm run lint

# Build
npm run build

# Backend tests
cd backend && npm test
```

## Health Check

```bash
curl http://localhost:3001/health
```
<!-- Backend deployment configuration updated -->
