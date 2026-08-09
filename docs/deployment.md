---
title: "Deployment"
description: "Guidelines for pushing NexLedger to production environments"
---

# Deployment Guide

NexLedger is built to be deployed on modern cloud platforms. The typical setup involves a platform like Render or Railway for the Node.js backend and database, and Vercel or Netlify for the React frontend.

## Database Deployment

1. Provision a managed PostgreSQL instance (e.g., Supabase, AWS RDS, Render Postgres).
2. Obtain the connection string.
3. Before your server accepts traffic, you must run the database migrations. Most PaaS providers allow you to define a "Build Command" or "Release Command". Ensure the command `npm run db:migrate` runs before the server starts.

## Backend Deployment (Node.js)

1. Set the root directory of the deployment to `/server`.
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. Set the necessary environment variables:
   - `DATABASE_URL`: Your production Postgres connection string.
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: A highly secure random string (minimum 32 characters).
   - `CORS_ORIGIN`: Your production frontend URL (e.g., `https://nexledger.com`).
   - `CLIENT_URL`: Alternatively, you can use this variable to dynamically allow CORS for a specific frontend.

> [!TIP]
> **CORS Fallback**: The server is pre-configured to automatically allow Cross-Origin requests from any origin ending in `.vercel.app`. This simplifies zero-config preview deployments for the frontend.

## Frontend Deployment (Vercel)

1. Connect your repository to Vercel and set the root directory to `/client`.
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Set the Environment Variable:
   - `VITE_SERVER_URL`: Your deployed backend URL (e.g., `https://nexledger-api.onrender.com`).
   - Do **not** append `/api` to this URL; the `api.ts` axios instance handles the prefix automatically.

## Troubleshooting CORS

If the frontend console logs `Access to XMLHttpRequest has been blocked by CORS policy`, ensure that:
1. The backend is actually running and hasn't spun down.
2. The `VITE_SERVER_URL` on the frontend is pointing to the correct HTTPS backend address.
3. You have pushed the latest backend code which contains the ultra-permissive CORS updates.
