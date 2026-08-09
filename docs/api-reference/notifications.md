---
title: "Notifications API"
description: "Endpoints for managing real-time and historical notifications"
---

# Notifications API

All notification routes are prefixed with `/api/notifications`.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header. These endpoints interact directly with the user who owns the token.

## Get Notifications

Retrieve the user's historical feed of notifications, ordered by most recent first.

- **Method**: `GET`
- **URL**: `/api/notifications`
- **Allowed Roles**: Any

### Query Parameters

| Field | Type | Description |
|-------|------|-------------|
| `limit` | `integer` | Results to return (default: 50) |
| `unreadOnly` | `boolean` | If true, only returns unread notifications |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "CHALLAN_CREATED",
      "title": "New Challan",
      "message": "Challan CHL-105 created by Sales Rep",
      "link": "/challans/uuid",
      "is_read": false,
      "created_at": "2026-08-09T14:00:00.000Z"
    }
  ]
}
```

---

## Get Unread Count

Quickly retrieve the total number of unread notifications for badge indicators.

- **Method**: `GET`
- **URL**: `/api/notifications/unread-count`

---

## Mark As Read

Mark a specific notification as read.

- **Method**: `PATCH`
- **URL**: `/api/notifications/:id/read`

---

## Mark All As Read

Mark all notifications belonging to the user as read.

- **Method**: `PATCH`
- **URL**: `/api/notifications/read-all`

---

## Get / Update Notification Settings

User-specific preferences controlling which real-time alerts they receive.

- **Method**: `GET` or `PATCH`
- **URL**: `/api/notifications/settings`

### Request Body (for PATCH)

| Field | Type | Description |
|-------|------|-------------|
| `preferences` | `object` | Key-value pairs of alert types (e.g., `{"inventory_alerts": false, "new_challans": true}`) |
