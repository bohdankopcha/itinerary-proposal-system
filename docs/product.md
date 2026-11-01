# Product

## What this is

A small internal tool for a luxury resort-travel concierge team. A concierge assembles a curated itinerary for a member's upcoming stay, sends it to the member as a proposal, and the member reviews, approves, and "pays" to lock it in. Payment and email are simulated.

Success = the full loop works end to end: **create → send → approve → pay**, and the two UIs feel right for their audiences (see [design.md](design.md)).

## Seed data

Three members, one upcoming reservation each. The first is the primary demo scenario.

| Member (placeholder email at `example.com`) | Reservation                                                |
| ------------------------------------------- | ---------------------------------------------------------- |
| **James Whitfield** (primary)               | **Villa Punta Mita, Mexico**, arrive Mar 15, depart Mar 22 |
| Amelia Hart                                 | Villa Cabo Azul, Cabo San Lucas, Mexico, different dates   |
| Daniel Okafor                               | Villa Maya Sol, Riviera Maya, Mexico, different dates      |

Year is 2027 so every stay is upcoming. Members and reservations are seeded only; the UI cannot create or edit them. Each reservation also has one seeded draft proposal with a full itinerary (see [data-model.md](data-model.md)). Exact values live in `prisma/seed.ts` and `prisma/seed-proposals.ts`.

## Roles

No authentication. A role is simply the route you are on.

| Role          | Route                           | Does                                                                                                         |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Concierge** | `/` (dashboard)                 | Picks a reservation, builds and edits a proposal, previews, sends, tracks all proposals for that reservation |
| **Member**    | `/proposal/[id]` (emailed link) | Reads the proposal, approves it, pays to lock it in                                                          |

The concierge is a professional who moves fast: clarity over decoration. The member is a guest of a luxury brand: the page must feel premium.

## Glossary

- **Reservation** – a member's stay: destination, villa, arrival and departure dates. Fixed context for every proposal.
- **Proposal** – a concierge-authored set of line items for one reservation, with a status and an optional note to the member. Its total is the sum of its line items.
- **Line item** – one bookable thing in a proposal: category, title, description, scheduled date/time, estimated price.
- **Note** – optional free-text message from the concierge, shown to the member at the top of the proposal.
- **Category** – one of six fixed groupings for line items: Dining, Activities, Wellness, Excursions, Transport, Experiences. Example items per category (UI hints only, not a catalog): private chef dinner; surf lesson; massage; whale watching; airport transfer; sunset cocktails.
- **Status** – `draft`, `sent`, `approved`, `paid`. See [proposal-lifecycle.md](proposal-lifecycle.md).
- **Sent email** – a record (and console log) of the simulated email delivering the proposal link to the member.
- **Lock in** – the member's final step; moves a proposal to `paid`.

## Capabilities (all required)

1. **Reservation switcher.** The dashboard serves multiple members. The selected reservation drives the trip header, the builder, and the proposals list. Selection is kept in the URL.
2. **Trip header.** Destination, villa, arrival, departure, and member name, prominent at the top.
3. **Build.** Add line items by picking a category, then filling title, description, date/time, price. Optional note.
4. **Edit draft.** A draft can be reopened in the builder, changed, and re-saved. Sent proposals are read-only.
5. **Preview.** Shows the proposal exactly as the member will see it.
6. **Send.** Writes a sent-email record, moves status to `sent`, shows a success state.
7. **Track.** The list shows every proposal of the selected reservation with its current status.
8. **Member page.** Itinerary as a **day-by-day timeline**, note, total, **Approve**, then **Pay & Lock In**, then an **animated confirmation**.
9. **Instant feedback.** Status changes update the UI optimistically and roll back on failure (rules in [proposal-lifecycle.md](proposal-lifecycle.md)).

## Out of scope

Real email or payments, authentication/authorization, creating or editing members and reservations, an item catalog or pricing engine, multi-currency, notifications, proposal versioning, cancellation or expiry, i18n.

## Deliverables beyond code

- Public repo with a README: how to run (one command), assumptions, what to improve, what was interesting/hard, and an honest list of anything broken or incomplete. Draft it from [decisions.md](decisions.md).
- A 5–10 minute recorded walkthrough of the full flow and the key decisions.
