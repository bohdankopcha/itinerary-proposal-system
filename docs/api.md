# API

Next.js route handlers under `src/app/api/`. **The exact request/response contract lives in the zod schemas in `src/lib/schemas/`.** This file lists routes and conventions only. To add or change a route, follow the `add-api-route` skill.

## Routes

| Method & path                   | Purpose                                                                          | Success |
| ------------------------------- | -------------------------------------------------------------------------------- | ------- |
| `GET /api/reservations`         | All reservations with member embedded, ordered by arrival                        | 200     |
| `GET /api/proposals`            | Proposal summaries, newest first; optional `reservationId` filter                | 200     |
| `POST /api/proposals`           | Create a `draft` with its note and line items in one request                     | 201     |
| `GET /api/proposals/[id]`       | One proposal: items (by scheduled time), note, reservation, member, `totalCents` | 200     |
| `PUT /api/proposals/[id]`       | Replace note and items of a `draft`                                              | 200     |
| `PATCH /api/proposals/[id]`     | Member transition to `approved` or `paid` (body: `status`)                       | 200     |
| `POST /api/proposals/[id]/send` | `draft`→`sent` and log the email                                                 | 200     |

Notes:

- The brief asks for "the member's current reservation"; with several members this became the list above. The dashboard picks one, see [decisions.md](decisions.md).
- `POST` takes the reservation id, an optional `notes`, and an `items` array (at least one). The dashboard builds items in local state, then "Save draft" posts them. "Send" saves first if needed (POST or PUT), then calls `/send`.
- `PUT`, `PATCH`, and `/send` return the updated proposal in the same shape as `GET /api/proposals/[id]`. `/send` also returns the created sent-email record.
- Transition rules, preconditions, and side effects: [proposal-lifecycle.md](proposal-lifecycle.md).
- `GET /api/proposals?reservationId=` with an unknown id is `404`, not an empty list, so a stale URL is noticed.
- Check order on `PUT`: unknown id (404), then `NOT_EDITABLE`, then item validation. A body that fails the zod schema is `400` before any of these.
- `GET /api/reservations` takes no request data, so under Cache Components it would be prerendered at build time; it calls `connection()` to stay request-time. Any future `GET` handler without request data needs the same.

## Pages

| Path             | View                                                    |
| ---------------- | ------------------------------------------------------- |
| `/`              | Redirects to `/planning`                                |
| `/planning`      | Concierge planner with no proposal open (empty builder) |
| `/planning/[id]` | Concierge planner with proposal `id` open               |
| `/proposal/[id]` | Client view of proposal `id`                            |

The proposal id is the only identifier in URLs; ids are opaque references (see [data-model.md](data-model.md)).

## Conventions

- **JSON only.** Dates are ISO 8601 strings; money is integer cents (`...Cents`); ids are opaque strings.
- **Success bodies** are the resource itself (no envelope). Lists are `{ "items": [...] }`.
- **Errors** share one shape, in every handler, with no exceptions:

  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human-readable summary",
      "details": []
    }
  }
  ```

  `details` is optional (zod issues as `{ path, message }` for validation errors).

| HTTP | `code`               | When                                                                                 |
| ---- | -------------------- | ------------------------------------------------------------------------------------ |
| 400  | `VALIDATION_ERROR`   | Malformed JSON, body/params/query failing the zod schema, item time outside the trip |
| 404  | `NOT_FOUND`          | Unknown proposal or reservation id (any well-formed string is a valid id format)     |
| 409  | `INVALID_TRANSITION` | Status change not allowed from the current status                                    |
| 409  | `NOT_EDITABLE`       | Editing a proposal that is not a draft                                               |
| 422  | `EMPTY_PROPOSAL`     | Sending a proposal with no items                                                     |
| 500  | `INTERNAL_ERROR`     | Anything unexpected; log server-side, return a generic message, never leak internals |

## Implementation rules

- Every handler validates params, query, and body with a zod schema before doing anything else.
- Handlers stay thin: parse → call a function in `src/lib/proposals/` → map the result. Domain functions throw typed domain errors (defined next to the domain code, no HTTP knowledge); one shared mapper turns them into the error shape and status above. No handler builds an error response by hand.
- The typed client in `src/lib/api-client/` parses responses with the same schemas and throws an error carrying `code` and `message`, so hooks and UI branch on `code`, not on status or text.
- No route is added for things the UI can compute (grouping by day, per-day subtotals). Proposal totals are the exception: computed server-side once, see [data-model.md](data-model.md).
