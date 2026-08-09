---
title: "Testing"
description: "Backend test suite and CI workflows"
---

# Testing

NexLedger utilizes `vitest` for running server-side unit tests and API integration tests.

## Running Tests

To run the backend test suite locally:

```bash
cd server
npm test
```

## Coverage and Scope

The test suite is primarily focused on the backend `src/` directory, specifically ensuring that:
- Zod schemas correctly validate payloads and reject malformed input.
- JWT utilities successfully sign and verify tokens, throwing appropriate errors on expiration.
- Custom Error classes serialize properly for the Express error handler middleware.
- Date and string formatting utilities accurately conform to expected outputs.

> [!NOTE]
> Database-integrated tests (which hit a real Postgres instance) are currently isolated to manual Postman QA collections rather than automated CI runs to avoid test pollution.

## Postman Collection

For API integration testing, a complete Postman collection is maintained alongside the project.
You can find the export at `postman/NexLedger.postman_collection.json`.

1. Import the collection and the associated `NexLedger.postman_environment.json` environment into Postman.
2. Ensure you are running the backend locally on port 5000.
3. Run the `Authentication > Login` request first. A script within Postman will automatically capture the returned JWT and store it in your environment variables.
4. Subsequent requests will automatically inject the token.
