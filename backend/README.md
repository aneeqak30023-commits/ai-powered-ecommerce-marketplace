# NexMart Backend

Express + Prisma + SQLite foundation for NexMart.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
```

## Run

```bash
npm run dev
```

Server starts on `http://localhost:3001` (or `PORT` from `.env`).

## Health Check

```bash
curl http://localhost:3001/health
```

## Tests

```bash
npm test
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend in development |
| `npm run start` | Start backend |
| `npm run test` | Run backend tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run pending migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## Database Schema

- **User** — accounts, auth data
- **Category** — product categories
- **Product** — catalog items
- **Review** — product reviews
- **Order** — purchase orders
- **OrderItem** — order line items
- **CartItem** — shopping cart entries
- **Wishlist** — saved products
- **Inventory** — stock tracking

Frontend data has not been migrated yet.
