# 🚀 NexLedger — Mini ERP + CRM Operations Portal

NexLedger is a full-stack, production-ready Mini ERP and CRM Operations Portal built to manage B2B operations. It features real-time inventory management, sales challan generation, customer lead tracking, and role-based access control to ensure secure, streamlined business processes.

---

## 📊 Project Audit Status

| Area | Status |
|---|---|
| Frontend Implementation | ✅ Complete |
| Backend Implementation | ✅ Complete |
| Database Schema | ✅ Complete |
| Authentication | ✅ Complete (JWT-based) |
| RBAC (Roles) | ✅ Complete (ADMIN, SALES, WAREHOUSE, ACCOUNTS) |
| API Endpoints | ✅ Complete (34+ Verified endpoints) |
| Setup / Migrations / Seed | ✅ Complete |

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8.2
- **Styling**: Tailwind CSS v4, `lucide-react` icons
- **UI Components**: Radix UI primitives (`@radix-ui/react-*`), Framer Motion
- **State & Data Fetching**: Zustand, React Query v5 (`@tanstack/react-query`)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **3D Graphics**: Three.js + React Three Fiber / Drei (used in Hero sections)

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5.2
- **Database**: PostgreSQL (`pg` library)
- **Authentication**: JWT (`jsonwebtoken`) + bcrypt
- **Security**: Helmet, express-rate-limit, cors
- **Validation**: Zod
- **Development**: `tsx`, `vitest`

---

## 🏗 Architecture & Core Business Workflows

The NexLedger architecture follows a traditional decoupled client-server model:

1. **Client Browser** (React SPA) communicates via REST JSON API to the Express server.
2. **Express Server** validates tokens, enforces role-based access control (RBAC), and sanitizes payloads via Zod.
3. **Database** (PostgreSQL) enforces referential integrity, constraints (e.g., stock cannot drop below zero), and timestamps.

### The "Sales Challan to Inventory" Workflow

```mermaid
graph TD
    A[Sales creates DRAFT Challan] --> B[Add Products to Draft]
    B --> C[Confirm Challan]
    C -->|API Validation| D{Stock Sufficient?}
    D -->|Yes| E[DB: Mark CONFIRMED]
    D -->|No| F[Reject 400]
    E --> G[DB: Deduct Product Stock]
    G --> H[DB: Insert 'OUT' Stock Movement]
```

---

## 🗄 Database Schema (ER Overview)

```mermaid
erDiagram
    users ||--o{ customers : "created_by"
    users ||--o{ products : "created_by"
    customers ||--o{ customer_followups : "has"
    customers ||--o{ challans : "has"
    challans ||--|{ challan_items : "contains"
    products ||--o{ challan_items : "appears_in"
    products ||--o{ stock_movements : "tracked_in"

    users {
        UUID id PK
        TEXT role "ADMIN, SALES, WAREHOUSE, ACCOUNTS"
    }
    customers {
        UUID id PK
        TEXT status "LEAD, ACTIVE, INACTIVE"
        TEXT type "RETAIL, WHOLESALE, DISTRIBUTOR"
    }
    products {
        UUID id PK
        INTEGER current_stock
    }
    challans {
        UUID id PK
        TEXT status "DRAFT, CONFIRMED, CANCELLED"
    }
    stock_movements {
        UUID id PK
        TEXT type "IN, OUT"
        INTEGER quantity
    }
```

---

## 🛡 Authentication & RBAC

Authentication is handled via JWT. Upon successful login (`POST /api/auth/login`), a token is issued. The client stores it locally (via Zustand store) and attaches it as `Bearer <token>` in the Authorization header.

### Role Matrix

| Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|---|---|---|---|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Customers | ✅ | ✅ | ❌ | ✅ |
| Edit/Create Customers | ✅ | ✅ | ❌ | ❌ |
| Add Customer Followups| ✅ | ✅ | ❌ | ❌ |
| View Products/Inventory| ✅ | ✅ | ✅ | ✅ |
| Edit/Create Products | ✅ | ❌ | ❌ | ❌ |
| Adjust Stock Manually | ✅ | ❌ | ✅ | ❌ |
| View Challans | ✅ | ✅ | ❌ | ✅ |
| Create/Confirm Challan| ✅ | ✅ | ❌ | ❌ |
| View/Manage Users | ✅ | ❌ | ❌ | ❌ |

*(Note: Any route violation results in a `403 Forbidden` response from the backend, accompanied by UI redirect to an Unauthorized page).*

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL running locally (or Supabase Postgres connection string)

### 1. Database Setup
Ensure PostgreSQL is running. Create a new local database, e.g., `nexledger_db`.

### 2. Environment Variables
Create a `.env` file in the `server` directory (see `.env.example` below):
```env
# /server/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexledger_db
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars!
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

### 3. Server Startup
```bash
cd server
npm install
# Run migrations to create schema
npm run db:migrate
# Seed database with demo data (do NOT run in production)
npm run db:seed
# Start the development server
npm run dev
```

### 4. Client Startup
```bash
cd client
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🔑 Demo Credentials

If you ran `npm run db:seed`, the database will be populated with a rich dataset including products, customers, existing challans, and stock movements.

All seed accounts use the exact same password:
**Password:** `NexLedger@2026!`

- **Admin**: `admin@nexledger.example.com`
- **Sales**: `sales@nexledger.example.com`
- **Warehouse**: `warehouse@nexledger.example.com`
- **Accounts**: `accounts@nexledger.example.com`

Full seed coverage and reset behavior are documented in [`docs/SEED_DATA.md`](docs/SEED_DATA.md).

---

## 🚀 Deployment Guide

### Backend Deployment (e.g., Render / Railway / Heroku)
1. Provide the `DATABASE_URL` pointing to your managed PostgreSQL instance.
2. Ensure `NODE_ENV=production` and `JWT_SECRET` is set to a long, secure random string.
3. Set `CORS_ORIGIN` to your production frontend URL (e.g., `https://nexledger.com`).
4. Build the typescript server: `npm run build`.
5. Start command: `npm start` (which runs `node dist/server.js`).
6. Note: Migrations (`npm run db:migrate`) should be run as part of the CI/CD pipeline or release phase before startup.

### Frontend Deployment (e.g., Vercel / Netlify)
1. Add environment variable `VITE_API_URL` pointing to the live backend (e.g., `https://api.nexledger.com/api`).
2. Build command: `npm run build`
3. Output directory: `dist`

---

## 📝 API & Postman Documentation

A complete set of API documentation and an importable Postman collection have been generated from the verified codebase.

- **API Documentation**: Located in [`docs/API.md`](./docs/API.md)
- **Postman Collection**: Located in [`postman/NexLedger.postman_collection.json`](./postman/NexLedger.postman_collection.json)
- **Postman Environment**: Located in [`postman/NexLedger.postman_environment.json`](./postman/NexLedger.postman_environment.json)

*(Import both the Collection and the Environment into Postman. Login via the `Authentication > Login` request to auto-populate the token environment variable.)*

---

## ⚠️ Known Limitations & Assumptions

### Critical / High
- **Concurrency**: While the DB uses constraints to prevent negative stock (`current_stock >= 0`), high-concurrency challan confirmations could theoretically result in transaction contention. A more robust explicit row lock (`SELECT FOR UPDATE`) on the product row might be needed for scale.
- **Images/Uploads**: The system currently does not support image uploads (e.g., product photos, user avatars).

### Medium / Low
- **Pagination**: The API `GET` endpoints support `page` and `limit`, but a bulk product catalog (>500 items) might require stricter server-side pagination limits enforced at the router level.
- **Taxes/Discounts**: The Challan item calculation assumes `total = quantity * unit_price`. There is currently no implementation for regional taxes (GST variations), shipping fees, or line-item discounts.
- **PDF Generation**: The `/challans/:id` page uses CSS `@media print` for paper outputs. Actual server-side PDF generation (e.g., Puppeteer/PDFKit) is not implemented.

### Assumptions
- **Product Cost vs Price**: Inventory valuation on the dashboard uses the selling `unitPrice`. A robust ERP would track Weighted Average Cost (WAC) or FIFO for actual inventory financial valuation.
- **Challan Editing**: Once a Challan is marked `CONFIRMED`, it cannot be edited or reverted. To reverse stock, a manual stock adjustment or a "Sales Return" module would need to be built.
