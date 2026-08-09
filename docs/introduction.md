---
title: "Introduction"
description: "Welcome to the NEXLEDGER documentation"
---

# NEXLEDGER Overview

NexLedger is a full-stack, production-ready Mini ERP and CRM Operations Portal built to manage B2B operations. It features real-time inventory management, sales challan generation, customer lead tracking, and role-based access control to ensure secure, streamlined business processes.

## Main Features

- **Customer Relationship Management (CRM):** Track customer details, statuses (Lead, Active, Inactive), and schedule automated follow-ups.
- **Product & Inventory Management:** Maintain a product catalog and track real-time stock levels with a comprehensive ledger of stock movements (IN/OUT).
- **Sales Challans:** Generate, draft, and confirm Sales Challans. Confirming a challan automatically deducts stock and records the movement.
- **Real-Time Notifications:** Live WebSocket-based alerts for critical business events like stock movements or new challans, complete with user-specific preferences.
- **Role-Based Access Control (RBAC):** Fine-grained permissions allowing `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` users to access only relevant sections.
- **Analytics Dashboard:** A comprehensive dashboard displaying KPIs, recent stock movements, and pending follow-ups.

## Target Users

NexLedger is built specifically for:
- **Sales Representatives:** To track leads, manage customer interactions, and generate challans on the fly.
- **Warehouse Managers:** To monitor low stock thresholds, perform manual stock adjustments, and oversee physical inventory.
- **Accounts & Administrators:** To audit operations, manage users, and oversee high-level organizational metrics.

## Technology Stack

### Frontend (Client)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4, `lucide-react` icons
- **State & Data Fetching**: Zustand, React Query v5
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM v7
- **Real-time**: Socket.IO Client

### Backend (Server)
- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5.2
- **Database**: PostgreSQL (using `pg` driver)
- **Real-time**: Socket.IO Server
- **Authentication**: JWT (`jsonwebtoken`) + bcrypt
- **Security**: Helmet, express-rate-limit, cors
- **Validation**: Zod
