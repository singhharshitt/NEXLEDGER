# NexLedger API Documentation

Base URL: `http://localhost:5000/api`

## Authentication
All protected endpoints require: `Authorization: Bearer <token>`

---

## Auth

### POST /auth/login
Public. Returns JWT on success.
**Body:** `{ email: string, password: string }`
**Success 200:** `{ success: true, data: { token: string, user: SafeUser } }`
**Error 401:** `{ success: false, message: "Invalid email or password" }`

### GET /auth/me
Auth required. Returns current user profile.
**Success 200:** `{ success: true, data: { user: SafeUser } }`

### POST /auth/logout
Auth required. Stateless logout.
**Success 200:** `{ success: true, message: "Logged out successfully" }`

---

## Users
Roles: ADMIN only

### GET /users
Returns all users ordered by created_at DESC.
**Success 200:** `{ success: true, data: SafeUser[] }`

### POST /users
Create a user. Duplicate email → 409.
**Body:** `{ name: string, email: string, password: string, role: "ADMIN"|"SALES"|"WAREHOUSE"|"ACCOUNTS" }`
**Success 201:** `{ success: true, data: SafeUser }`

### GET /users/:id
Get user by UUID. Non-existent → 404.

### PUT /users/:id
Update user fields. Last admin deactivation/role-change → 409.
**Body:** `{ name?, email?, role?, isActive? }`

---

## Customers
Roles: GET → ADMIN/SALES/ACCOUNTS; POST/PUT → ADMIN/SALES; DELETE → ADMIN

### GET /customers
Paginated list. Filters: `search`, `status`, `type`, `followUpOverdue`.
**Success 200:** `{ success: true, data: { items: Customer[], pagination: { page, limit, total, totalPages } } }`

### POST /customers
**Body:** `{ name, businessName, type, status, mobile, email?, gst?, creditLimit?, notes? }`
**Success 201:** `{ success: true, data: Customer }`

### GET /customers/:id
### PUT /customers/:id
### DELETE /customers/:id
Soft-delete: sets status=INACTIVE.

### GET /customers/:id/followups
Roles: ADMIN/SALES

### POST /customers/:id/followups
Roles: ADMIN/SALES
**Body:** `{ date: string, notes: string }`

---

## Products
Roles: GET all → all roles; POST/PUT → ADMIN; stock → ADMIN/WAREHOUSE

### GET /products
Paginated. Filters: `search`, `category`, `stockStatus` (healthy|low|out).

### GET /products/categories
Returns sorted, deduplicated category array.

### POST /products
**Body:** `{ name, sku, category, unitPrice, minStock?, unit?, description? }`

### GET /products/:id
### PUT /products/:id
Roles: ADMIN only.

### POST /products/:id/stock
Roles: ADMIN/WAREHOUSE. Adjust stock IN or OUT.
**Body:** `{ type: "IN"|"OUT", quantity: integer > 0, notes? }`
**Error 409:** Insufficient stock (OUT with quantity > current_stock)

### GET /products/:id/stock-movements
Roles: ADMIN/WAREHOUSE.

---

## Stock
Roles: ADMIN/WAREHOUSE

### GET /stock
Paginated inventory with stockStatus.

### GET /stock/low
All products where current_stock <= minimum_stock.

---

## Challans
Roles: GET → ADMIN/SALES/ACCOUNTS; POST/PUT/confirm/cancel → ADMIN/SALES

### GET /challans
Paginated. Filters: `search`, `status`, `customerId`, `dateFrom`, `dateTo`.

### POST /challans
Creates DRAFT challan with product snapshots.
**Body:** `{ customerId, items: [{ productId, quantity }], notes? }`
**Error 404:** Unknown customerId or productId
**Error 409:** Duplicate productIds in items

### GET /challans/:id
### PUT /challans/:id
DRAFT only. Replaces all items atomically.

### POST /challans/:id/confirm
Atomic stock deduction. DRAFT → CONFIRMED.
**Error 409:** Already confirmed, already cancelled, or insufficient stock

### POST /challans/:id/cancel
DRAFT → CANCELLED (no stock change). CONFIRMED → CANCELLED (stock restored).

---

## Dashboard
Roles: All authenticated

### GET /dashboard
Combined stats + activity + recent challans + low-stock.

### GET /dashboard/stats
`{ totalCustomers, totalProducts, lowStockItems, outOfStockCount, draftChallans, confirmedChallans }`

### GET /dashboard/activity
10 most recent events across all resources.

### GET /dashboard/stock-chart
Per-day IN/OUT totals for last 7 days.

---

## Health

### GET /health
Public. DB connectivity check.
**Success 200:** `{ success: true, message: "API is healthy", timestamp, database: "connected" }`

---

## Error Response Format
All errors: `{ success: false, message: string, errors: Array<{ field?: string, message: string }> }`

| Status | Scenario |
|--------|----------|
| 401 | Unauthenticated / expired / invalid token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Business rule conflict |
| 422 | Validation error (field-level errors in errors[]) |
| 500 | Unexpected server error |
