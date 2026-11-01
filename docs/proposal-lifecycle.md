# Proposal lifecycle

The state machine is the heart of the app. It lives in one place in code, `src/lib/proposals/` (a pure transition table plus a `transition(from, to)` guard, no DB or HTTP). Every route and UI affordance derives from it. Every transition, valid and invalid, has a test.

## States

`draft` → `sent` → `approved` → `paid`

| Status     | Meaning                           | Items and note editable | Visible to member |
| ---------- | --------------------------------- | ----------------------- | ----------------- |
| `draft`    | Being built by the concierge      | yes                     | no                |
| `sent`     | Email logged; awaiting the member | no                      | yes               |
| `approved` | Member accepted; awaiting payment | no                      | yes               |
| `paid`     | Locked in. **Terminal.**          | no                      | yes               |

## Transitions

| From       | To         | Initiated by | Via                             | Preconditions / side effects                                                                                         |
| ---------- | ---------- | ------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `draft`    | `sent`     | Concierge    | `POST /api/proposals/[id]/send` | At least one item. In one DB transaction: set status + `sentAt`, insert a `SentEmail`. Then `console.log` the email. |
| `sent`     | `approved` | Member       | `PATCH /api/proposals/[id]`     | Sets `approvedAt`.                                                                                                   |
| `approved` | `paid`     | Member       | `PATCH /api/proposals/[id]`     | Sets `paidAt`. No real payment.                                                                                      |

Everything else is illegal: skipping a step (`sent`→`paid`), going backwards, leaving `paid`, or repeating the current state (`approved`→`approved` is an error, not a no-op, so clients learn about stale views).

`PATCH` accepts only `approved` or `paid` as the target. `sent` is reachable **only** through `/send`, because it has a side effect (the email). A `PATCH` with `status: "sent"` is an invalid transition.

## Editing a draft

Not a status transition. `PUT /api/proposals/[id]` replaces the note and items of a `draft` (see [data-model.md](data-model.md)). It leaves status and timestamps unchanged. On any non-draft proposal it fails with `NOT_EDITABLE`. Validation is the same as on create (items within trip dates, price rules). Sending an edited draft goes through the normal `/send`.

## Rules

- **Atomic and race-safe.** Apply a transition as a conditional write (`where: { id, status: from }`) and treat zero rows updated as `INVALID_TRANSITION`. Two concurrent approvals must not both succeed. The same guard (`status: "draft"`) protects edits.
- **Send is all-or-nothing.** A status change without an email record (or vice versa) must be impossible; use a transaction. Console logging happens after commit.
- **Email content** (`SentEmail.bodyPreview`): short plain text: greeting, destination and dates, item count, total, the note if present, and the absolute link to `/proposal/[id]` (base URL from env, with a localhost default). Sent to the reservation's member.
- **Member view per status** (see [design.md](design.md)): `draft` → "not available" page; `sent` → itinerary + **Approve**; `approved` → itinerary + **Pay & Lock In**; `paid` → animated confirmation. The buttons are derived from the transition table, not hard-coded per status.

## Optimistic updates (client)

Applies to the three status changes only: send, approve, pay. Never to create or edit.

1. On click, cancel in-flight queries for that proposal and write the target status into the TanStack Query cache (detail and list). The UI shows the new state immediately.
2. On error, restore the snapshot and show the error `message`. For `INVALID_TRANSITION` also refetch, so the UI converges on the real status.
3. On settle, always invalidate the proposal detail and list queries so the server response wins.
4. Send's success state (recipient, confirmation) renders only from the server response, since the email record does not exist until then; only the status badge is optimistic.
5. Logic lives in hooks in `src/hooks/`, one mutation hook per transition, sharing a helper for the cache work.

## Errors

Shared format and codes are in [api.md](api.md). Lifecycle-specific:

| Situation                                          | HTTP | Code                 |
| -------------------------------------------------- | ---- | -------------------- |
| Transition not in the table (incl. stale/repeated) | 409  | `INVALID_TRANSITION` |
| Send with zero items                               | 422  | `EMPTY_PROPOSAL`     |
| Edit items or note of a non-draft proposal         | 409  | `NOT_EDITABLE`       |
| Unknown proposal id                                | 404  | `NOT_FOUND`          |
| `status` missing or not one of the allowed values  | 400  | `VALIDATION_ERROR`   |

The `message` for `INVALID_TRANSITION` names the current and requested status so the UI can show it.
