---
title: "Contributing"
description: "Guidelines for contributing to NexLedger"
---

# Contributing

We welcome contributions to the NexLedger project. Before you begin, please ensure you review the core architecture and development guidelines.

## Branching Strategy

- `main`: The production-ready codebase.
- `development`: The active working branch.
- Feature branches: Should be branched off `development` and named descriptively (e.g., `feat/add-invoice-pdf`, `bugfix/dashboard-chart-crash`).

## Pull Requests

1. Keep PRs focused. Do not mix unrelated refactoring with new feature additions.
2. If changing the database schema, ensure a proper sequential `.sql` migration file is included.
3. If changing API surface, ensure you update the documentation in the `docs/api-reference/` folder.
4. Provide a descriptive summary of your changes and any manual QA steps required to verify.

## Design Constraints

When contributing to the frontend, you must adhere strictly to the established design system. Do not introduce alternative styling libraries. Adhere to the strict policy against altering the NexLedger SVG logo artwork.

## Code Standards

- Run `npm run build` locally in both the client and server directories to catch strict TypeScript errors.
- Prefer explicit array-based batching for PostgreSQL queries (`ANY($1)`) over looping individual queries to prevent N+1 issues.
- All external input must be validated via Zod schemas before being passed to a controller.
