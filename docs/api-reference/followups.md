---
title: "Customer Follow-ups API"
description: "Endpoints for managing CRM follow-ups for specific customers"
---

# Follow-ups API

All follow-up routes are nested under the specific customer they belong to.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

## List Follow-ups

Retrieve all recorded follow-ups for a specific customer.

- **Method**: `GET`
- **URL**: `/api/customers/:id/followups`
- **Allowed Roles**: `ADMIN`, `SALES`

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "notes": "Discussed Q3 inventory requirements",
      "follow_up_date": "2026-08-15T00:00:00.000Z",
      "created_by": "uuid",
      "created_at": "2026-08-09T14:00:00.000Z"
    }
  ]
}
```

---

## Create Follow-up

Add a new follow-up note to a customer. Doing so will also update the customer's top-level `follow_up_date` to match the latest interaction if one is provided.

- **Method**: `POST`
- **URL**: `/api/customers/:id/followups`
- **Allowed Roles**: `ADMIN`, `SALES`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | `string` | Yes | The contents of the follow-up or discussion |
| `follow_up_date` | `string` | No | ISO date string for the next scheduled follow-up |

**Example Request:**
```json
{
  "notes": "Customer is interested in wholesale pricing. Calling back next week.",
  "follow_up_date": "2026-08-16"
}
```
