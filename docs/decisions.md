# Decisions

Short "what and why" records. Source for the README ("assumptions", "what I'd improve") and the walkthrough. Add a new entry when a non-obvious choice is made; keep each to a few lines. Entries marked _assumption_ fill a gap in the brief.

## Chosen

**SQLite via Prisma 7 (better-sqlite3 adapter).** Required to be SQLite; Prisma gives typed queries and migrations with one-command setup (`npm run db:prepare`). Trade-off: heavier toolchain than raw better-sqlite3, accepted for type safety and a reviewable schema.

**One Next.js project, one process.** UI and route handlers together; no separate API server, no queue, no cache. Fewest moving parts; `npm run dev` is the whole setup.

**No authentication.** Out of scope for the brief. The unguessable proposal id is the member's access link; the dashboard is open. Production needs real auth and signed/expiring links.

**State machine in pure code.** One transition table in `src/lib/proposals/`, fully unit-tested, used by API and UI. Illegal moves return `409 INVALID_TRANSITION`. See [proposal-lifecycle.md](proposal-lifecycle.md).

**`sent` only via `/send`.** `PATCH` handles member actions only; the email side effect cannot be skipped. _The brief lists `sent` among PATCH values; this is a deliberate tightening._

**Strict, non-idempotent transitions.** Repeating approve returns 409 rather than silently succeeding, so stale clients find out.

**Multiple members via a reservation switcher.** The brief's single "current reservation" endpoint became `GET /api/reservations` returning a list; the selected reservation is derived from the open proposal, or held in local state when none is open. The data model already supported it, so cost was UI and seed only.

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

**Concierge and member UI follow the Claude Design, Solar Flare theme only.** One theme keeps the token set small; the design's other three themes were left out. Details in [design.md](design.md).

**Quick-add parsing is a pure function with tests.** The palette's text parser lives in `src/lib/proposals/quick-add.ts`. It matches full weekday and month names only (the design's prefix match read "sunset" as Sunday). End time and length are optional: ranges ("7-9pm", "from 7 to 9pm", "7pm till 9pm") and durations ("for 2h", "for 90 min") set `durationMinutes` using the item sheet's rules (30 min minimum, within the day, clamped to 24:00); invalid values leave it null. A bare "to" or "for" ("Trip to Tulum", "table for two") is only consumed when followed by a valid time or duration, and a range needs an am/pm or colon on its numbers so "7-9" stays untouched.

**Member status changes wait for the server before the final animation.** Approve and Pay update the badge optimistically, but the confirmation screen appears only after the PATCH succeeds, so a rollback never leaves the member on a "confirmed" page.

**Builder state is a local working copy, re-seeded only when the reservation or proposal changes.** Edits stay in memory until "Save draft" or "Send" (which saves first); one dirty flag drives the discard confirm, the "Unsaved changes" / "All changes saved" cue, and whether Save draft and Discard changes are active or shown. Discard reverts the working copy to the last saved proposal (it no longer navigates to a new proposal; "New proposal" does that). No effects: the copy resets by comparing a source key during render.

**Routes: `/planning[/<proposalId>]` for the concierge, `/proposal/<id>` for the client; `/` redirects to `/planning`.** The proposal id is the single identifier in URLs; no query params, no reservation id. UI state (tab, client without a proposal, builder) is local, so there is nothing to keep in sync with the URL. The dashboard sits in the `/planning` layout (pages render nothing) so that changing the id does not remount it and drop local state. Client switches and opens navigate inside a transition with an optimistic id, so the UI responds before the route settles. Trade-off: a reload on `/planning` forgets which client was chosen for an empty builder.

**The concierge sees no ids.** Earlier a hashed "P-####" reference was shown; it was a third, fake identifier. Rows and headers use client, destination, dates and status instead. The concierge reaches the client view through the client link in the send-success dialog.

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

**Vercel deploy with a build-time SQLite snapshot.** Vercel functions have a read-only filesystem, so the build runs `db:prepare` (migrate + seed) into `dev.db`, which is traced into the functions and copied to `/tmp` on cold start (`src/lib/db/client.ts`). Trade-off: writes are per-instance and ephemeral, so data resets on cold starts; acceptable for a demo, a hosted database would be needed for real use.
