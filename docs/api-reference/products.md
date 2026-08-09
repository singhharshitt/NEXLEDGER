---
title: "Products API"
description: "Endpoints for managing the master product catalog"
---

# Products API

All product routes are prefixed with `/api/products`.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

## List Products

Retrieve the product catalog with optional search and filtering.

- **Method**: `GET`
- **URL**: `/api/products`
- **Allowed Roles**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

### Query Parameters

| Field | Type | Description |
|-------|------|-------------|
| `page` | `integer` | Page number (default: 1) |
| `limit` | `integer` | Results per page (default: 20) |
| `search` | `string` | Search by SKU, name, or description |
| `category` | `string` | Filter by exact category name |
| `inStock` | `boolean` | If true, only returns items where `current_stock > 0` |

---

## Get Categories

Returns a unique list of all active product categories currently in the database.

- **Method**: `GET`
- **URL**: `/api/products/categories`
- **Allowed Roles**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

---

## Get Product

Retrieve details for a specific product.

- **Method**: `GET`
- **URL**: `/api/products/:id`
- **Allowed Roles**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

---

## Create Product

Add a new product to the master catalog. Note that you can set the initial stock, but all future stock changes must go through the stock adjustment or challan endpoints.

- **Method**: `POST`
- **URL**: `/api/products`
- **Allowed Roles**: `ADMIN`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Product name |
| `sku` | `string` | Yes | Unique stock keeping unit |
| `category` | `string` | Yes | Category name |
| `unit_price` | `number` | Yes | Price per unit |
| `unit` | `string` | No | Measuring unit (default: 'piece') |
| `current_stock` | `integer` | No | Initial stock (default: 0) |
| `minimum_stock` | `integer` | No | Low stock alert threshold (default: 0) |
| `description` | `string` | No | Detailed description |

---

## Update Product

Modify product details. Note: You cannot update `current_stock` directly via this endpoint.

- **Method**: `PUT`
- **URL**: `/api/products/:id`
- **Allowed Roles**: `ADMIN`

### Request Body

Accepts the same fields as the **Create** endpoint, but all fields are optional.

---

## Adjust Stock

Manually adjust the stock level for a product. This will automatically generate a `stock_movement` ledger entry with `reference_type: 'MANUAL'`.

- **Method**: `POST`
- **URL**: `/api/products/:id/stock`
- **Allowed Roles**: `ADMIN`, `WAREHOUSE`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `string` | Yes | `IN` (add stock) or `OUT` (remove stock) |
| `quantity` | `integer`| Yes | Must be greater than 0 |
| `notes` | `string` | No | Reason for manual adjustment |

---

## Get Product Stock Movements

Retrieve the history of stock movements for this specific product.

- **Method**: `GET`
- **URL**: `/api/products/:id/stock-movements`
- **Allowed Roles**: `ADMIN`, `WAREHOUSE`
