# NexLedger Backend — Architecture

## Layered Architecture

```
HTTP Request
     │
     ▼
Express Router (src/routes/)
     │  mounts middleware, delegates to controllers
     ▼
Middleware Stack (src/middleware/)
     │  helmet → rate-limit → cors → morgan → body-parser
     │  → authenticate → authorize → validate
     ▼
Controllers (src/controllers/)
     │  parse req, call service, send res
     ▼
Services (src/services/)
     │  business logic, orchestrate repos, manage transactions
     ▼
Repositories (src/repositories/)
     │  SQL queries via pg Pool/PoolClient
     ▼
PostgreSQL (Supabase)
```

## Directory Structure

```
server/
├── src/
│   ├── app.ts           # Express app factory
│   ├── server.ts        # Entry point + startup checks
│   ├── config/          # env.ts, database.ts
│   ├── middleware/       # authenticate, authorize, validate, errorHandler, asyncHandler
│   ├── routes/          # Route files per domain
│   ├── controllers/     # Thin HTTP handlers
│   ├── services/        # Business logic layer
│   ├── repositories/    # SQL data access layer
│   ├── schemas/         # Zod validation schemas
│   ├── types/           # Domain types (index.ts), Express augment (express.d.ts)
│   └── utils/           # AppError, withTransaction, response, mappers, jwt, errors
├── scripts/             # migrate.ts, seed.ts
├── migrations/          # 001–009 SQL migration files
├── tests/               # Vitest integration and unit tests
└── docs/                # This documentation
```

## Key Design Decisions

**JWT-only authentication**: No Supabase Auth. JWTs are signed with JWT_SECRET and contain only `userId` and `role`. The authenticate middleware verifies the token from the payload alone — no DB query per request.

**SELECT FOR UPDATE + deadlock-safe ordering**: During challan confirmation and stock adjustments, product rows are locked with `SELECT FOR UPDATE`. Locks are acquired in ascending `product_id` (UUID) order across all concurrent transactions to prevent deadlocks.

**Snapshot immutability**: When a challan is created, `product_name_snapshot`, `sku_snapshot`, and `unit_price_snapshot` are copied into `challan_items`. Subsequent price changes do not affect existing challan items.

**withTransaction helper**: All multi-step database operations use `withTransaction(fn)` which wraps the callback in BEGIN/COMMIT/ROLLBACK automatically.

**Schema migrations**: The `scripts/migrate.ts` runner applies `.sql` files from `migrations/` in lexicographic order. Each file is wrapped in a transaction and tracked in `schema_migrations(filename)`.
