# NexLedger API Documentation

This document describes the **actual, verified** API endpoints available in the NexLedger CRM & ERP Operations Portal.

## Base URL
Development: `http://localhost:5000/api`

## Authentication
NexLedger uses JWT Bearer Token authentication.
Include the token in the headers for all protected endpoints:
```http
Authorization: Bearer <your_jwt_token>
```

## API Endpoint Matrix

| Method | Endpoint | Auth Required | Allowed Roles | Purpose |
|---|---|---|---|---|
| GET | `/api/health` | No | - | Health check |
| POST | `/api/auth/login` | No | - | Authenticate user |
| GET | `/api/auth/me` | Yes | All | Get current user profile |
| POST | `/api/auth/logout` | Yes | All | Clear token (client-side) |
| GET | `/api/users` | Yes | ADMIN | List users |
| GET | `/api/users/:id` | Yes | ADMIN | Get user details |
| POST | `/api/users` | Yes | ADMIN | Create user |
| PUT | `/api/users/:id` | Yes | ADMIN | Update user |
| GET | `/api/customers` | Yes | ADMIN, SALES, ACCOUNTS | List customers |
| POST | `/api/customers` | Yes | ADMIN, SALES | Create customer |
| GET | `/api/customers/:id` | Yes | ADMIN, SALES, ACCOUNTS | Get customer |
| PUT | `/api/customers/:id` | Yes | ADMIN, SALES | Update customer |
| DELETE | `/api/customers/:id` | Yes | ADMIN | Delete customer |
| GET | `/api/customers/:id/followups` | Yes | ADMIN, SALES | List followups |
| POST | `/api/customers/:id/followups` | Yes | ADMIN, SALES | Add followup |
| GET | `/api/products` | Yes | ADMIN, SALES, WAREHOUSE, ACCOUNTS | List products |
| POST | `/api/products` | Yes | ADMIN | Create product |
| GET | `/api/products/categories` | Yes | ADMIN, SALES, WAREHOUSE, ACCOUNTS | List product categories |
| GET | `/api/products/:id` | Yes | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Get product |
| PUT | `/api/products/:id` | Yes | ADMIN | Update product |
| POST | `/api/products/:id/stock` | Yes | ADMIN, WAREHOUSE | Adjust product stock |
| GET | `/api/products/:id/stock-movements`| Yes | ADMIN, WAREHOUSE | Get stock movements |
| GET | `/api/stock` | Yes | ADMIN, WAREHOUSE | List inventory |
| GET | `/api/stock/low` | Yes | ADMIN, WAREHOUSE | List low stock items |
| GET | `/api/challans` | Yes | ADMIN, SALES, ACCOUNTS | List challans |
| POST | `/api/challans` | Yes | ADMIN, SALES | Create draft challan |
| GET | `/api/challans/:id` | Yes | ADMIN, SALES, ACCOUNTS | Get challan |
| PUT | `/api/challans/:id` | Yes | ADMIN, SALES | Update draft challan |
| POST | `/api/challans/:id/confirm` | Yes | ADMIN, SALES | Confirm draft challan |
| POST | `/api/challans/:id/cancel` | Yes | ADMIN, SALES | Cancel draft challan |
| GET | `/api/dashboard` | Yes | All | Get dashboard home |
| GET | `/api/dashboard/stats` | Yes | All | Get dashboard stats |
| GET | `/api/dashboard/activity` | Yes | All | Get dashboard activity |
| GET | `/api/dashboard/stock-chart` | Yes | All | Get dashboard stock chart |

---

## Example Request/Response

### 1. Login
**POST** `/api/auth/login`

**Request Body**
```json
{
  "email": "admin@example.com",
  "password": "NexLedger@2026!"
}
```

**Success Response (200)**
```json
{
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

### 2. Create Challan (Draft)
**POST** `/api/challans`

**Request Body**
```json
{
  "customerId": "uuid",
  "status": "DRAFT",
  "items": [
    {
      "productId": "uuid",
      "quantity": 5
    }
  ],
  "notes": "Testing API"
}
```

### 3. Confirm Challan
**POST** `/api/challans/:id/confirm`

**Description**
Marks the challan as `CONFIRMED`, deducts stock from `products`, and inserts an `OUT` record in `stock_movements`.

---

## Known Business Rules & Validations

1. **Challan Processing**:
   - A Challan starts as `DRAFT`.
   - Adding items to a `DRAFT` does not deduct inventory.
   - Calling `POST /api/challans/:id/confirm` marks the challan as `CONFIRMED`.
   - Confirmation verifies stock. If `current_stock < quantity`, the server rejects with a `400` validation error (Insufficient stock).
   - If stock is sufficient, the backend deducts the stock, inserts the stock movement, and captures snapshot pricing in `challan_items`.

2. **Customer Contact Requirement**:
   - `contact_name`, `business_name`, `mobile`, `type`, and `status` are required.
   - Types: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`.

3. **Stock Adjustments**:
   - Authorized via `POST /api/products/:id/stock`.
   - Requires `type` (`IN` or `OUT`) and `quantity`. Negative stock values are rejected by DB constraint (`current_stock >= 0`).

---

## Error Handling
The backend uses standard HTTP status codes:
- `400`: Bad Request (Validation failure, e.g. Insufficient stock)
- `401`: Unauthorized (Missing/Invalid Token)
- `403`: Forbidden (User role not authorized)
- `404`: Not Found (Resource UUID not found)
- `500`: Internal Server Error

Error Response Format:
```json
{
  "success": false,
  "error": "Message describing the error",
  "details": [
    { "field": "quantity", "message": "Expected number, received string" }
  ]
}
```
