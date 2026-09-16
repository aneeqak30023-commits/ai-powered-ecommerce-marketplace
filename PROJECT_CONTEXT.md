# NexMart Project Context

## Project
AI-Powered E-Commerce Marketplace (NexMart)

## Frontend
- React 19
- Vite
- React Router v7
- Tailwind CSS
- GitHub Pages deployment

Frontend URL:
https://aneeqak30023-commits.github.io/ai-powered-ecommerce-marketplace/

## Backend
- Node.js
- Express
- Prisma
- PostgreSQL
- Railway deployment

Backend URL:
https://nexmart-backend-production.up.railway.app

## Railway Status
Backend is working.

Confirmed:
- /health works
- /api/products works
- /api/categories works
- PostgreSQL is connected
- 42 products seeded
- 6 categories seeded
- 42 inventory records seeded

## Completed Backend Modules
- Authentication
- Products
- Categories
- Inventory
- Cart
- Wishlist
- Orders
- Reviews
- Customer Support
- Knowledge Base
- Payments architecture
- Admin Dashboard APIs
- Analytics
- Security hardening
- PostgreSQL production setup
- Railway deployment

## Payment
Cash on Delivery works.

Safepay online payment integration exists but sandbox credentials/API issue is still unresolved.

Do NOT modify Safepay unless specifically requested.

## Current Production Problem

The GitHub Pages frontend still shows:

"Unable to load products"

and:

"Unexpected token ... is not valid JSON"

The Railway backend itself is working.

The important discovery was:

/ai-powered-ecommerce-marketplace/products

was returning GitHub Pages HTML 404 instead of the React SPA.

This causes the frontend to try to parse HTML as JSON, producing the "Unexpected token" error.

## SPA Routing

BrowserRouter basename is already correct:

/ai-powered-ecommerce-marketplace

DO NOT change the BrowserRouter basename unless there is clear evidence that it is wrong.

GitHub Actions workflow was updated with:

cp dist/index.html dist/404.html

This was added to create the GitHub Pages SPA fallback.

Commit associated with this fix:
103f210

## Important CORS History

Local development required allowing different Vite ports.

Current backend CORS should allow:
- http://localhost:5173
- http://localhost:5176
- http://localhost:5177
- http://localhost:3001
- https://aneeqak30023-commits.github.io

Do not unnecessarily modify CORS while debugging the GitHub Pages issue.

## Important Rules For Kilo Code

1. Do not repeat already completed work.
2. Do not make broad changes.
3. Diagnose the exact root cause before editing files.
4. Make the smallest possible change.
5. Do not modify working Railway backend functionality unless evidence requires it.
6. Do not change BrowserRouter basename without evidence.
7. Do not change productApi.js just because the error says "Unexpected token".
8. Remember that the Railway API returns valid JSON.
9. The current issue is specifically the GitHub Pages production frontend/deployment/routing.
10. Keep responses concise because previous Kilo sessions have reached output limits.

## Current Next Task

Verify whether the GitHub Pages deployment actually contains and serves:

dist/404.html

and whether the latest GitHub Actions deployment is using commit 103f210 or a newer commit.

Do not make changes until the exact cause is confirmed.