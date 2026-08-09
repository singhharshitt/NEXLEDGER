---
title: "Stock Movements API"
description: "Endpoints for querying the inventory ledger"
---

# Stock Movements API

The Stock Movements API is nested within the specific product it relates to. This represents the immutable ledger of IN and OUT transactions for inventory.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

## List Stock Movements

Retrieve the history of stock adjustments, challan deductions, and additions for a specific product.

- **Method**: `GET`
- **URL**: `/api/products/:id/stock-movements`
- **Allowed Roles**: `ADMIN`, `WAREHOUSE`

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "type": "OUT",
      "quantity": 50,
      "reference_type": "CHALLAN",
      "reference_id": "uuid",
      "notes": "Challan CHL-1025 confirmed",
      "created_by_name": "Sales Rep",
      "created_at": "2026-08-09T14:00:00.000Z"
    },
    {
      "id": "uuid",
      "product_id": "uuid",
      "type": "IN",
      "quantity": 100,
      "reference_type": "MANUAL",
      "notes": "New vendor shipment",
      "created_by_name": "Warehouse Admin",
      "created_at": "2026-08-01T09:00:00.000Z"
    }
  ]
}
```
