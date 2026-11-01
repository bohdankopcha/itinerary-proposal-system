# Decisions

Short "what and why" records. Source for the README ("assumptions", "what I'd improve") and the walkthrough. Add a new entry when a non-obvious choice is made; keep each to a few lines. Entries marked _assumption_ fill a gap in the brief.

## Chosen

**SQLite via Prisma 7 (better-sqlite3 adapter).** Required to be SQLite; Prisma gives typed queries and migrations with one-command setup (`npm run db:prepare`). Trade-off: heavier toolchain than raw better-sqlite3, accepted for type safety and a reviewable schema.

**One Next.js project, one process.** UI and route handlers together; no separate API server, no queue, no cache. Fewest moving parts; `npm run dev` is the whole setup.

**No authentication.** Out of scope for the brief. The unguessable proposal id is the member's access link; the dashboard is open. Production needs real auth and signed/expiring links.

**State machine in pure code.** One transition table in `src/lib/proposals/`, fully unit-tested, used by API and UI. Illegal moves return `409 INVALID_TRANSITION`. See [proposal-lifecycle.md](proposal-lifecycle.md).

**`sent` only via `/send`.** `PATCH` handles member actions only; the email side effect cannot be skipped. _The brief lists `sent` among PATCH values; this is a deliberate tightening._

**Strict, non-idempotent transitions.** Repeating approve returns 409 rather than silently succeeding, so stale clients find out.

**Multiple members via a reservation switcher.** The brief's single "current reservation" endpoint became `GET /api/reservations` returning a list; the selected reservation lives in the URL query (shareable, no extra state or effect). The data model already supported it, so cost was UI and seed only.

**Edit draft = full replace (`PUT`).** Simplest correct semantics for a list of items: one transaction, no per-item diffing or endpoints. Cost: item ids are unstable, so nothing may reference them.

**Optimistic UI for status changes only.** Transitions are small, predictable, and guarded server-side, so rollback is rare and cheap. Create and edit stay pessimistic because the server shapes the result.

**Animations are CSS-only.** No animation dependency; honours `prefers-reduced-motion`.

**One proposal presentation component.** Member page and concierge preview share it, so what the concierge previews is what the member gets.

**Money as integer cents, USD only.** Avoids float errors; no currency handling to explain.

**Totals derived, not stored.** One computation, no drift.

**Resort wall-clock times, no timezone math.** Fewer bugs than conversions; correct for a trip anchored to one location.

**Sent proposals are immutable.** The member approves exactly what they saw.

**Contracts as zod schemas, shared by server and client.** One definition per payload; types via `z.infer`. Docs link to them instead of copying.

**`PATCH` accepts all four statuses syntactically; the domain rejects `sent`.** `status: "sent"` is a valid enum value but an illegal move via `PATCH`, so it returns `409 INVALID_TRANSITION` (as the lifecycle doc requires); only unknown or missing values are `400`.

**Conditional writes instead of locks.** Every transition and edit is `updateMany({ where: { id, status: from } })`; zero rows means the state changed under us. Send does this write first inside its transaction and rolls back on `EMPTY_PROPOSAL`, so the check and the write cannot interleave with an edit. Covered by a concurrent-approve test.

**Categories and statuses are lowercase string values** (`dining`, `draft`, ...) defined once in `src/lib/schemas/proposal.ts` and validated at the boundary and when reading rows. No DB enums, so the list has one definition.

**API dates:** reservation dates are `YYYY-MM-DD`; timestamps and `scheduledAt` are ISO strings ending in `Z`, with `scheduledAt` read as resort wall-clock (see data-model.md).

**API tests call the real route handlers** against a throwaway SQLite file (`test.db`, migrated and seeded by `vitest.global-setup.ts`), asserting both responses and DB rows.

**Docs as agent context.** `docs/` holds intent and rationale only; anything readable from code (fields, payloads) is linked, never duplicated. Behavior changes must update the matching doc.

## Assumptions

- _Assumption:_ trip year is 2027 so seeded stays are upcoming.
- _Assumption:_ member emails are placeholders at `example.com`; the two extra members and their stays are invented demo data.
- _Assumption:_ line item time must fall within the proposal's stay; price is non-negative.
- _Assumption:_ a reservation can have several proposals; the dashboard shows all of them for the selected stay.
- _Assumption:_ a proposal is created with its items in one request; drafts are not auto-saved.

## Known gaps / next steps (README "what I'd improve")

- Real auth, expiring member links, role separation.
- Real email provider and payment processor; webhook-driven `paid`.
- Proposal cancel/expire and re-send; edit history.
- Managing members and reservations from the UI.
- Item catalog with default prices; multi-currency.
- Pagination for the proposals list.
- E2E tests (Playwright) for the full loop; currently unit and API-level tests.
