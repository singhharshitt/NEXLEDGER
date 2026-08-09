---
title: "Troubleshooting"
description: "Solutions for common issues and errors"
---

# Troubleshooting Guide

## Frontend Issues

### "Network Error" or Failed API Requests
- **Symptom**: The console shows `ERR_CONNECTION_REFUSED` or `net::ERR_FAILED`.
- **Cause**: The React application cannot communicate with the backend.
- **Solution**: 
  1. Ensure the Node.js backend is running.
  2. If running locally, ensure no other application is using port `5000`.
  3. If deployed, check the `VITE_SERVER_URL` in the frontend environment variables. Ensure it uses `https://` and does **not** include `/api` at the end (the Axios instance appends it automatically).

### CORS Preflight Blocked
- **Symptom**: `Access to XMLHttpRequest has been blocked by CORS policy`.
- **Solution**: Ensure your frontend's deployment URL (e.g., `https://nexledger.com`) is added to the backend's `CORS_ORIGIN` environment variable. Wait for the backend to redeploy. *(Note: Vercel subdomains `.vercel.app` are automatically whitelisted as a fallback).*

## Backend Issues

### `relation "table_name" does not exist`
- **Symptom**: The backend starts but crashes or throws 500 errors when fetching data.
- **Cause**: The database schema hasn't been created.
- **Solution**: Run `npm run db:migrate` in the `server/` directory to build the PostgreSQL tables.

### EMAXCONNSESSION Crash (Too many DB clients)
- **Symptom**: App hangs during large query operations, resulting in connection pool exhaustion.
- **Solution**: Ensure your backend queries do not suffer from N+1 lookup loops. (This was resolved for Challan Items by migrating to bulk `ANY($1)` PostgreSQL array lookups).

## Database Issues

### Negative Stock Errors
- **Symptom**: Attempting to confirm a challan throws an error indicating stock constraint violation.
- **Cause**: Another user or challan depleted the product's stock simultaneously.
- **Solution**: The database's `CHECK (current_stock >= 0)` constraint successfully prevented negative inventory. You must manually add stock or reduce the draft challan quantity before trying again.
