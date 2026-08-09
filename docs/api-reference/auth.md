---
title: "Authentication API"
description: "Endpoints for login, logout, and session verification"
---

# Authentication API

All authentication routes are prefixed with `/api/auth`.

## Login

Authenticate a user and retrieve a JSON Web Token (JWT).

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Authentication**: None
- **Allowed Roles**: Any

### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `email` | `string` | User's email address |
| `password` | `string` | User's plaintext password |

**Example Request:**
```json
{
  "email": "admin@nexledger.example.com",
  "password": "NexLedger@2026!"
}
```

### Response

- **200 OK**: Successfully authenticated.

**Example Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "e58129cc-...",
    "email": "admin@nexledger.example.com",
    "full_name": "System Admin",
    "role": "ADMIN",
    "is_active": true
  }
}
```

- **400 Bad Request**: Validation failed (e.g., missing email).
- **401 Unauthorized**: Invalid credentials.

---

## Get Current User (Me)

Retrieve the authenticated user's profile based on the provided JWT.

- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Authentication**: Required (`Bearer Token`)
- **Allowed Roles**: Any valid user

### Response

- **200 OK**: Successfully verified.

**Example Response:**
```json
{
  "id": "e58129cc-...",
  "email": "admin@nexledger.example.com",
  "full_name": "System Admin",
  "role": "ADMIN",
  "is_active": true
}
```

- **401 Unauthorized**: Missing or invalid token.
- **404 Not Found**: User no longer exists in the database.

---

## Logout

Terminate the current session. (Note: Since JWTs are stateless, this endpoint primarily serves to instruct clients to drop their local token and may be used for future token blacklisting/audit logging).

- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Authentication**: Required (`Bearer Token`)
- **Allowed Roles**: Any valid user

### Response

- **200 OK**: Successfully logged out.

**Example Response:**
```json
{
  "message": "Logged out successfully"
}
```
