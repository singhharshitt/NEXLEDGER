---
title: "Dashboard API"
description: "Endpoints for fetching high-level analytics and aggregated data"
---

# Dashboard API

The dashboard endpoints provide aggregated data suitable for charts, widgets, and top-level organizational overviews.

**Authentication Required:** All endpoints require a valid JWT via the `Authorization: Bearer <token>` header.

All dashboard routes are prefixed with `/api/dashboard`.

## Get Dashboard Overview

Retrieve all core statistics needed to render the main dashboard page in a single optimized payload.

- **Method**: `GET`
- **URL**: `/api/dashboard`
- **Allowed Roles**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCustomers": 120,
      "totalProducts": 45,
      "lowStockItems": 3,
      "pendingChallans": 5,
      "totalSales": "125000.00"
    },
    "recentActivity": [
      {
        "type": "CHALLAN_CREATED",
        "title": "Challan CHL-001 created",
        "timestamp": "2026-08-09T14:00:00.000Z"
      }
    ],
    "stockChart": [
      {
        "category": "Electronics",
        "value": 500
      }
    ]
  }
}
```

---

## Get Individual Metrics

The dashboard API also provides granular endpoints if you prefer to lazy-load specific widgets on the client to improve Time To Interactive (TTI).

### Get Stats
- **URL**: `/api/dashboard/stats`
- **Response**: Returns only the `stats` object containing top-level numbers.

### Get Activity
- **URL**: `/api/dashboard/activity`
- **Response**: Returns a timeline array of recent system activity (challans created, stock moved, customers added).

### Get Stock Chart
- **URL**: `/api/dashboard/stock-chart`
- **Response**: Returns an array of stock valuation or volume grouped by product category, formatted for use in Recharts.
