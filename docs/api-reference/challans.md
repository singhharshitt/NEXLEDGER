---
title: "Challans API"
description: "Endpoints for generating, confirming, and managing Sales Challans"
---

# Challans API

All challan routes are prefixed with `/api/challans`.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

## List Challans

Retrieve a paginated list of challans, fully joined with their associated items.

- **Method**: `GET`
- **URL**: `/api/challans`
- **Allowed Roles**: `ADMIN`, `SALES`, `ACCOUNTS`

### Query Parameters

| Field | Type | Description |
|-------|------|-------------|
| `page` | `integer` | Page number (default: 1) |
| `limit` | `integer` | Results per page (default: 20) |
| `status` | `string` | Filter by `DRAFT`, `CONFIRMED`, or `CANCELLED` |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "challan_number": "CHL-001001",
      "customer_id": "uuid",
      "status": "CONFIRMED",
      "total_quantity": 25,
      "total_amount": "5000.00",
      "items": [
        {
          "product_id": "uuid",
          "product_name_snapshot": "Widget A",
          "sku_snapshot": "ITEM-1001",
          "unit_price_snapshot": "200.00",
          "quantity": 25,
          "total_price": "5000.00"
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Get Challan

Retrieve details for a specific challan, including its line items.

- **Method**: `GET`
- **URL**: `/api/challans/:id`
- **Allowed Roles**: `ADMIN`, `SALES`, `ACCOUNTS`

---

## Create Draft Challan

Create a new challan in `DRAFT` status. This does **not** deduct stock from inventory.

- **Method**: `POST`
- **URL**: `/api/challans`
- **Allowed Roles**: `ADMIN`, `SALES`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_id` | `string` | Yes | UUID of the customer |
| `notes` | `string` | No | Additional remarks |
| `items` | `array` | Yes | List of line items |
| `items[].product_id` | `string` | Yes | Product UUID |
| `items[].quantity` | `integer`| Yes | Quantity for this item |

---

## Update Draft Challan

Modify an existing `DRAFT` challan. You cannot modify a `CONFIRMED` or `CANCELLED` challan.

- **Method**: `PUT`
- **URL**: `/api/challans/:id`
- **Allowed Roles**: `ADMIN`, `SALES`

### Request Body

Accepts the same structure as the **Create** endpoint.

---

## Confirm Challan

Transitions a challan from `DRAFT` to `CONFIRMED`. **This action is irreversible.**
It performs the following inside a database transaction:
1. Verifies sufficient stock exists.
2. Deducts the stock from `products.current_stock`.
3. Creates `OUT` entries in the `stock_movements` ledger.
4. Updates the challan status and sets `confirmed_at`.
5. Emits a real-time WebSocket notification to relevant users.

- **Method**: `POST`
- **URL**: `/api/challans/:id/confirm`
- **Allowed Roles**: `ADMIN`, `SALES`

---

## Cancel Challan

Transitions a challan from `DRAFT` to `CANCELLED`.
You cannot cancel a challan once it is `CONFIRMED`.

- **Method**: `POST`
- **URL**: `/api/challans/:id/cancel`
- **Allowed Roles**: `ADMIN`, `SALES`
