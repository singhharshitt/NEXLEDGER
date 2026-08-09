# NexLedger Backend

Production-quality Node.js + TypeScript + Express.js REST API for a B2B ERP/CRM/Inventory SaaS platform. Connects to PostgreSQL via `DATABASE_URL`.

## Quick Start

```bash
# 1. Install dependencies
cd server
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and other settings

# 3. Run migrations
npm run db:migrate

# 4. Seed demo data
npm run db:seed

# 5. Start development server
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | JWT signing secret (min 32 chars in production) |
| `PORT` | — | HTTP port (default: 5000) |
| `NODE_ENV` | — | `development` \| `test` \| `production` (default: development) |
| `CORS_ORIGIN` | ✓ | Allowed origins, comma-separated |
| `JWT_EXPIRES_IN` | — | Token expiry (default: `7d`) |
| `BCRYPT_ROUNDS` | — | Bcrypt work factor 8–14 (default: 10) |

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run db:seed` | Populate NexLedger demo data (non-production only) |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:reset` | Migrate + seed in one step |

## Demo Credentials (seed data only)

| Email | Password | Role |
|-------|----------|------|
| admin@nexledger.example.com | NexLedger@2026! | ADMIN |
| sales@nexledger.example.com | NexLedger@2026! | SALES |
| warehouse@nexledger.example.com | NexLedger@2026! | WAREHOUSE |
| accounts@nexledger.example.com | NexLedger@2026! | ACCOUNTS |

See `../docs/SEED_DATA.md` for seed coverage, reset behavior, and the main demo scenario.

## API Overview

See [`docs/api.md`](docs/api.md) for full endpoint documentation.

Base URL: `http://localhost:5000/api`

Key endpoints:
- `POST /api/auth/login` — get JWT token
- `GET /api/health` — health check (public)
- All other endpoints require `Authorization: Bearer <token>`

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for system design details.

Layers: Routes → Middleware → Controllers → Services → Repositories → PostgreSQL

## Database

See [`docs/database.md`](docs/database.md) for full schema documentation.

Run migrations before first start: `npm run db:migrate`
