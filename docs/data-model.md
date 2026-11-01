# Data model

Source of truth for fields, types, and relations: [`prisma/schema.prisma`](../prisma/schema.prisma). This file records the entities and **why** they look the way they do. Do not restate fields here. Change procedure: `db-change` skill.

## Entities

```
Member 1─* Reservation 1─* Proposal 1─* ProposalItem
                              Proposal 1─* SentEmail
```

| Entity         | Purpose                                                          | Why it is separate                                                              |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Member`       | The guest. Name, email (email is the send target).               | Email belongs to the person, not the stay. Several members exist.               |
| `Reservation`  | One stay: destination, villa, arrival, departure.                | Proposals are about a stay; trip dates bound what a line item may be scheduled. |
| `Proposal`     | Status container for one offer, with an optional concierge note. | Owns lifecycle and timestamps; items hang off it.                               |
| `ProposalItem` | One line item (category, title, description, time, price).       | One-to-many; ordered by scheduled time for display.                             |
| `SentEmail`    | Append-only log of simulated emails (recipient, body preview).   | Audit trail of what was "sent".                                                 |

A reservation may have several proposals (alternatives or revisions). The dashboard lists them all.

## Design rules

- **Normalize just enough.** No `categories` table: the six categories are a fixed list defined once in `src/lib/schemas/` and stored as a string/enum on the item. No catalog table: every line item is free-form and carries its own price.
- **Money is integer minor units (cents), single currency (USD).** Never floats. Formatting happens only in the UI.
- **Totals are derived, never stored.** One function in `src/lib/proposals/` sums items; API responses include `totalCents`. Storing it would create a second source of truth.
- **Status is stored on `Proposal`; its legal changes are defined in code**, see [proposal-lifecycle.md](proposal-lifecycle.md). The DB does not enforce transitions.
- **Per-status timestamps** (`sentAt`, plus `approvedAt` and `paidAt`, which go beyond the minimum brief) are set once, on the transition. They show history without a separate status-log table.
- **`notes` is a nullable text column on `Proposal`.** Empty input is stored as null, not an empty string.
- **Only drafts are mutable.** Items and notes can change while `draft`; from `sent` on, the member approves exactly what they saw. Enforced in the domain layer.
- **Editing a draft replaces its items wholesale** in one transaction (delete all, insert the new set). Item ids are not stable across edits and nothing may reference them.
- **Dates and times are resort wall-clock.** Arrival/departure are calendar dates; item `scheduledAt` is stored as a UTC `DateTime` that is _interpreted as local resort time_ and displayed with `timeZone: "UTC"`. No timezone conversion anywhere. This avoids off-by-one-day bugs. Day grouping and "Day N" labels derive from the date part and the reservation's arrival date.
- **Flight times are minutes since midnight in resort time** (`arrivalMinutes` on the first day, `departureMinutes` on the last), optional. They only drive the planner markers.
- **Item duration is optional** (`durationMinutes`, null = the category default). The end time is derived (start + duration) and must stay within the visible day; there is no stored end timestamp.
- **Item time must fall within the proposal's reservation, arrival to departure inclusive of both days.** Needs the reservation, so it is validated in `src/lib/proposals/`, not only in the zod schema.
- **IDs are opaque random strings (cuid).** With no auth, the unguessable id in `/proposal/[id]` is the access control for the member link.

## Seed

`prisma/seed.ts`, idempotent (upserts with fixed ids): the members and reservations from [product.md](product.md), plus one draft proposal per reservation (data in `prisma/seed-proposals.ts`).

Proposals are created only if their id is missing and never overwritten, so `npm run dev` does not undo edits or status changes made in the UI. To get the original data back, run `npm run db:reset`.

James's proposal is the demo itinerary: 2-4 items on most days, one packed day (6 items) and one deliberately empty day, so the timeline and planner show both extremes. The other two have 2-3 items per day.
