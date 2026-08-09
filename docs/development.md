---
title: "Local Development"
description: "Guidelines and best practices for developing NexLedger"
---

# Development Guidelines

## Tools and Environment

We highly recommend the following tools for developing NexLedger:

- **VS Code**: With the ESLint, Prettier, and Tailwind CSS IntelliSense extensions installed.
- **Postman / Insomnia**: For direct API testing and interacting with backend routes independently of the frontend.
- **DBeaver / pgAdmin / TablePlus**: A GUI for inspecting the local PostgreSQL database, viewing `stock_movements`, and monitoring raw schema updates.

## Committing Code

NexLedger currently does not enforce strict pre-commit hooks, but it is expected that all TypeScript compiles cleanly before a commit.

```bash
# Check backend types
cd server && npm run build

# Check frontend types
cd client && npm run build
```

## Adding a New Feature

When adding a new feature that touches the database (for example, a new `invoices` table), follow this order of operations:

1. **Migration First**: Create a new `.sql` file in `server/migrations/` sequentially numbered (e.g., `015_create_invoices.sql`). Do not use an ORM to generate this. Ensure constraints and foreign keys are explicitly defined.
2. **Types**: Update `server/src/types/common.ts` to include the new data models.
3. **Validators**: Add new `Zod` validation schemas in `server/src/validators/schemas.ts`.
4. **Controllers & Routes**: Build out the API logic and mount it in `index.ts`.
5. **Frontend API Layer**: Add methods to the appropriate service file in `client/src/services/`.
6. **Frontend UI**: Build the React components. Ensure you use the existing `shadcn/ui` components from `client/src/components/ui` rather than building primitive form elements from scratch.

## Logo Integrity

A strict requirement for all UI development in NexLedger is preserving the provided SVG logo exactly as it exists.
Do not embed the logo inline to recolor it via CSS, and do not replace it with text or icons. Reference it directly via `src="/logo/nexledger-logo.svg"`.
