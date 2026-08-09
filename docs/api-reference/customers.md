---
title: "Customers API"
description: "Endpoints for managing CRM customers and their details"
---

# Customers API

All customer routes are prefixed with `/api/customers`.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

## List Customers

Retrieve a paginated list of customers, with optional filtering.

- **Method**: `GET`
- **URL**: `/api/customers`
- **Allowed Roles**: `ADMIN`, `SALES`, `ACCOUNTS`

### Query Parameters

| Field | Type | Description |
|-------|------|-------------|
| `page` | `integer` | Page number (default: 1) |
| `limit` | `integer` | Results per page (default: 20) |
| `search` | `string` | Search by business name, contact name, or mobile |
| `status` | `string` | Filter by `LEAD`, `ACTIVE`, or `INACTIVE` |
| `type` | `string` | Filter by `RETAIL`, `WHOLESALE`, or `DISTRIBUTOR` |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_name": "Acme Corp",
      "contact_name": "John Doe",
      "status": "ACTIVE",
      "type": "WHOLESALE"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## Get Customer

Retrieve details for a specific customer.

- **Method**: `GET`
- **URL**: `/api/customers/:id`
- **Allowed Roles**: `ADMIN`, `SALES`, `ACCOUNTS`

---

## Create Customer

Add a new customer to the system.

- **Method**: `POST`
- **URL**: `/api/customers`
- **Allowed Roles**: `ADMIN`, `SALES`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `business_name` | `string` | Yes | Name of the business |
| `contact_name` | `string` | Yes | Primary contact person |
| `mobile` | `string` | Yes | Mobile number |
| `email` | `string` | No | Email address |
| `type` | `string` | No | `RETAIL`, `WHOLESALE`, or `DISTRIBUTOR` (default: RETAIL) |
| `status` | `string` | No | `LEAD`, `ACTIVE`, or `INACTIVE` (default: LEAD) |

---

## Update Customer

Modify an existing customer's details.

- **Method**: `PUT`
- **URL**: `/api/customers/:id`
- **Allowed Roles**: `ADMIN`, `SALES`

### Request Body

Accepts the same fields as the **Create** endpoint, but all fields are optional.

---

## Delete Customer

Permanently remove a customer. This action will fail if the customer has associated Sales Challans.

- **Method**: `DELETE`
- **URL**: `/api/customers/:id`
- **Allowed Roles**: `ADMIN`
