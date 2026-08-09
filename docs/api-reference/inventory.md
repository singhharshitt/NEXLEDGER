---
title: "Inventory API"
description: "Endpoints for warehouse inventory and low stock reporting"
---

# Inventory API

The Inventory endpoints provide warehouse-specific views of the products table. All routes are prefixed with `/api/stock`.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

## List Inventory

Retrieve the inventory catalog, similar to the Products endpoint but optimized for warehouse roles.

- **Method**: `GET`
- **URL**: `/api/stock`
- **Allowed Roles**: `ADMIN`, `WAREHOUSE`

### Query Parameters

| Field | Type | Description |
|-------|------|-------------|
| `page` | `integer` | Page number (default: 1) |
| `limit` | `integer` | Results per page (default: 20) |
| `search` | `string` | Search by SKU, name, or description |
| `category` | `string` | Filter by exact category name |
| `inStock` | `boolean` | If true, only returns items where `current_stock > 0` |

---

## List Low Stock

Retrieve all products where `current_stock` is less than or equal to `minimum_stock`. This endpoint is heavily used by the dashboard and warehouse alerts.

- **Method**: `GET`
- **URL**: `/api/stock/low`
- **Allowed Roles**: `ADMIN`, `WAREHOUSE`

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "ITEM-1001",
      "name": "Widget A",
      "current_stock": 5,
      "minimum_stock": 10
    }
  ]
}
```
