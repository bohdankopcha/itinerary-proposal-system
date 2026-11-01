---
name: add-api-route
description: Step-by-step pattern for adding or changing an API endpoint - zod schema, domain function, thin route handler, api-client method, test. Use whenever creating or modifying a route handler under src/app/api, or when a feature needs a new backend operation.
---

# Add an API route

Keep the layers separate so logic stays testable without Next.js.

1. **Schema** – in `src/lib/schemas/`, define zod schemas for the request and response. Export types with `z.infer`. This is the contract.
2. **Domain function** – in `src/lib/proposals/`, implement the business logic as a plain function (no `Request`/`Response`, no React). It takes parsed input and returns data or throws a typed domain error. DB access goes through `src/lib/db/client.ts`.
3. **Route handler** – `src/app/api/<resource>/route.ts`. Keep it thin: parse input with the zod schema, call the domain function, map the result or error to the shared response format. No business logic here. TODO: shared error format and helper.
4. **API client** – add a typed method in `src/lib/api-client/` that uses the same schemas to type and parse the response. Hooks call this, never `fetch` directly.
5. **Tests** – unit-test the domain function (success, validation failure, edge cases, invalid state transitions). Test the schema where it has non-trivial rules.

Finish with `npm run check`.
