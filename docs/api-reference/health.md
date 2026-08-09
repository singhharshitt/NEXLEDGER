---
title: "Health API"
description: "Endpoints for monitoring system health and uptime"
---

# Health API

The health check endpoint is used by uptime monitoring services (like UptimeRobot) or deployment platforms (like Render/Vercel) to verify that the backend and database are healthy.

## Check Health

Verifies the Express server is responsive and that a basic `SELECT 1` query can successfully execute against the PostgreSQL database.

- **Method**: `GET`
- **URL**: `/api/health`
- **Authentication**: None required.
- **Allowed Roles**: Any

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-08-09T14:40:54.000Z",
    "database": "CONNECTED",
    "uptime": 14502.32
  }
}
```

- **503 Service Unavailable**: The database connection has failed or the server is shutting down.
