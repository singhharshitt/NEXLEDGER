---
title: "Security & Authentication"
description: "JSON Web Tokens, Role-Based Access Control, and API Security"
---

# Authentication & Security

NexLedger secures its API using state-less JSON Web Tokens (JWT) and enforces strict Role-Based Access Control (RBAC).

## Authentication Flow

1. **Login Request**: Client sends `email` and `password` to `POST /api/auth/login`.
2. **Validation**: The server queries the `users` table and compares the hashed password using `bcrypt`.
3. **Token Generation**: If valid, the server signs a JWT containing the `userId` and `role` using the `JWT_SECRET`.
4. **Client Storage**: The frontend persists this token via `Zustand` state (and implicitly local storage).
5. **Authenticated Requests**: Subsequent API calls to protected routes must include the token in the `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```

## Role-Based Access Control (RBAC)

The system supports four distinct roles defined by the `Role` enum:

- `ADMIN`
- `SALES`
- `WAREHOUSE`
- `ACCOUNTS`

Routes are protected by two layers of middleware:
1. `authenticate`: Verifies the JWT signature and expiration.
2. `authorize(...roles)`: Verifies the decoded user role is within the allowed array of roles for that specific endpoint.

### Role Permissions Matrix

| Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---------|-------|-------|-----------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Customers | ✅ | ✅ | ❌ | ✅ |
| Edit Customers | ✅ | ✅ | ❌ | ❌ |
| Manage Products | ✅ | ❌ | ❌ | ❌ |
| View Inventory | ✅ | ✅ | ✅ | ✅ |
| Adjust Stock | ✅ | ❌ | ✅ | ❌ |
| View Challans | ✅ | ✅ | ❌ | ✅ |
| Create Challans | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |

## Security Middleware

NexLedger implements several application-level security best practices via standard Express middlewares:

- **Helmet**: Sets various HTTP headers to help protect the app (e.g., `Strict-Transport-Security`, `X-Content-Type-Options`).
- **CORS**: Restricts cross-origin requests. `CORS_ORIGIN` (and `CLIENT_URL`) strictly dictate which frontends can communicate with the backend.
- **Express Rate Limit**: Protects the API against brute-force and DDoS attacks. Limited to 300 requests per 15 minutes in `production` (and 1000 in `development`).

## Error Responses

When authentication or authorization fails, the API responds with standardized JSON errors:

- **401 Unauthorized**: Missing token, invalid token signature, or expired token.
- **403 Forbidden**: Token is valid, but the user's role is not authorized to access the specific endpoint.

Example Error Response:
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action"
}
```
