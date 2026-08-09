---
title: "Getting Started"
description: "How to set up and run NEXLEDGER locally"
---

# Local Development Setup

Follow these steps to get the NEXLEDGER repository running on your local machine for development.

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v20 or higher recommended.
- **PostgreSQL**: A running local or remote instance (e.g., Supabase or local Docker container).
- **npm**: (Comes bundled with Node.js).

## Repository Setup

Clone the repository and install dependencies for both the client and server.

```bash
# Clone the repo
git clone https://github.com/nexledger/nexledger.git
cd nexledger

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

## Backend Configuration

Navigate to the `server/` directory and configure your environment.

### 1. Environment Variables

Create a `.env` file in the `server` directory. You can use the provided `.env.example` as a template.

```env
# server/.env

# The PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexledger_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars!
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Server Port
PORT=5000
NODE_ENV=development

# Allowed Origins (for CORS and Socket.io)
CORS_ORIGIN=http://localhost:5173
```

### 2. Database Setup & Migrations

NexLedger manages its schema via raw SQL migrations. To initialize your database:

```bash
# Apply all pending schema migrations
npm run db:migrate
```

*Optional*: If you want to populate the database with demo users, products, and challans for testing:
```bash
npm run db:seed
```
> **Warning**: Do not run `db:seed` against a production database.

### 3. Running the Backend

Start the Express development server (runs with hot-reloading via `tsx`):

```bash
npm run dev
```
The backend API will be available at `http://localhost:5000/api`.

## Frontend Configuration

Navigate to the `client/` directory.

### 1. Environment Variables

Create a `.env` file in the `client` directory.

```env
# client/.env
SERVER_URL=http://localhost:5000
```
*Note: The frontend API client automatically appends `/api` to this URL.*

### 2. Running the Frontend

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`. 

## Demo Login

If you ran the database seed command (`npm run db:seed`), you can log in immediately with the following demo credentials (all use the same password: `NexLedger@2026!`):

- **Admin**: `admin@nexledger.example.com`
- **Sales**: `sales@nexledger.example.com`
- **Warehouse**: `warehouse@nexledger.example.com`
- **Accounts**: `accounts@nexledger.example.com`
