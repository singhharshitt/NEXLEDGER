---
title: "Frontend Development"
description: "React client architecture and UI patterns"
---

# Frontend Architecture

The NexLedger client is a Single Page Application (SPA) built using **React 19**, **TypeScript**, and **Vite 8**.

## Core Libraries

- **State Management**: `zustand` is used for global client state (e.g., Auth, Notifications). `react-query` is used for server state caching and synchronization.
- **Routing**: `react-router-dom` v7 manages client-side navigation.
- **Styling**: `tailwindcss` v4 provides utility-first CSS.
- **UI Components**: Headless components from `radix-ui` form the foundation, implemented via a custom Shadcn-inspired design system in `src/components/ui`.
- **Forms**: `react-hook-form` paired with `@hookform/resolvers/zod` ensures type-safe, strict form validation matching the backend schemas.

## Project Structure

```
client/src/
├── components/   # Reusable UI components (buttons, dialogs, charts)
├── features/     # Feature-specific modules (auth, dashboard, challans)
├── hooks/        # Custom React hooks
├── lib/          # Utility functions (api-utils, formatters)
├── pages/        # Route-level page components
├── services/     # API integration layer (Axios)
├── store/        # Zustand state stores
└── types/        # TypeScript interfaces and global types
```

## Styling & Design System

The application uses a unified design system defined in `index.css`.
Tailwind CSS provides the utility classes, but primary colors and layout variables are defined globally to ensure a consistent, premium look.

### The Logo Rule
> [!WARNING]
> The NexLedger logo is a finalized asset located at `public/logo/nexledger-logo.svg`. It must **never** be altered, recolored, stretched, or replaced. Any UI changes must accommodate the existing logo artwork.

## API Integration

The `src/services/api.ts` file exports a pre-configured `axios` instance.

### Automatic Token Injection
An Axios request interceptor automatically retrieves the JWT from `localStorage` and appends it to the `Authorization` header.

### Error Handling
An Axios response interceptor intercepts `401 Unauthorized` responses and automatically triggers a forced logout, redirecting the user to the login page (unless the request itself was to the login endpoint).

## Real-Time Notifications

The `SocketProvider` context wrapper initializes a `socket.io-client` connection upon user login. It listens for events emitted by the backend (such as `challan_created`) and updates the `useNotificationStore` state, triggering toast alerts via the UI.
