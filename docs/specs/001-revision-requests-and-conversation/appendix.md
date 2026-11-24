# Spec 001 appendix

Reference material for [spec.md](spec.md). Nothing here changes the contract; it explains, details and proves it.

|                                                                |                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [A. Non-goals](#a-non-goals)                                   | [G. Security, accessibility, performance](#g-security-accessibility-performance) |
| [B. Entry kinds](#b-entry-kinds)                               | [H. Acceptance criteria](#h-acceptance-criteria)                                 |
| [C. Data model details](#c-data-model-details)                 | [I. Test plan and traceability](#i-test-plan-and-traceability)                   |
| [D. Edge cases](#d-edge-cases)                                 | [J. Docs to update](#j-docs-to-update)                                           |
| [E. Decisions and alternatives](#e-decisions-and-alternatives) | [K. Rollout and migration](#k-rollout-and-migration)                             |
| [F. Surface behavior details](#f-surface-behavior-details)     | [L. Implementation slices](#l-implementation-slices)                             |

## A. Non-goals

| Not doing                                         | Why                                                                                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real-time delivery (WebSocket/SSE)                | One process, SQLite, no auth. Polling is enough for a negotiation measured in minutes ([D-4](#e-decisions-and-alternatives)).                         |
| Unread counters, read receipts, typing indicators | Need per-viewer identity, which the app deliberately lacks.                                                                                           |
| Edit or delete messages                           | A negotiation log is evidence. Append-only is simpler and safer.                                                                                      |
| Attachments, rich text, mentions                  | Plain text covers the need.                                                                                                                           |
| Concierge-initiated withdrawal or expiry          | Separate feature ("cancel/expire" in the known gaps). Includes recalling a mistaken revision ([OQ-4](spec.md#7-edge-cases-decisions-open-questions)). |
| Per-item identity across revisions (true diffs)   | Item ids are unstable by design. The change summary is deliberately coarse ([D-5](#e-decisions-and-alternatives)).                                    |
| Real authentication of authors                    | Out of scope app-wide. Consequences in [G](#g-security-accessibility-performance).                                                                    |
| Email for every chat message                      | Notifications are out of scope ([OQ-3](spec.md#7-edge-cases-decisions-open-questions)).                                                               |

## B. Entry kinds

| `kind`              | Author              | Body                     | Created by                |
| ------------------- | ------------------- | ------------------------ | ------------------------- |
| `chat`              | member or concierge | required                 | `POST /messages`          |
| `changes_requested` | member              | required                 | `POST /request-changes`   |
| `declined`          | member              | required                 | `POST /decline`           |
| `revision_sent`     | concierge           | required (cover message) | `POST /resend`            |
| `sent`              | system              | none                     | `POST /send` (revision 1) |
| `approved`          | system              | none                     | approve transition        |
| `paid`              | system              | none                     | pay transition            |

Transition entries are written in the same transaction as the transition. Only `chat` entries count toward the 500 cap ([FR-10](spec.md#2-requirements)): a status change must never be blocked by a full conversation.

## C. Data model details

Follow the `db-change` skill when building.

```mermaid
erDiagram
    Proposal ||--o{ ProposalItem : "working copy"
    Proposal ||--o{ ProposalRevision : "published snapshots"
    Proposal ||--o{ ProposalMessage : "conversation"
    Proposal ||--o{ SentEmail : "log"
```

| Change                         | Notes                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ProposalRevision`**         | `proposalId`, `number`, note, items snapshot (serialized), `schemaVersion`, `sentAt`. Unique on `(proposalId, number)`. Total is derived, never stored.                                                                                                                                                                                   |
| **`ProposalMessage`**          | `proposalId`, `kind`, `authorRole` (`member` / `concierge` / `system`), `authorName`, `body` (null for system entries), `revision` (the `currentRevision` read in the writing transaction), `clientId` (nullable, unique per proposal, stored with the payload to detect conflicts), `createdAt`. Index on `(proposalId, createdAt, id)`. |
| **`Proposal.currentRevision`** | Integer, 0 until first send. Denormalized for the atomic guard ([D-7](#e-decisions-and-alternatives)). Invariant tested.                                                                                                                                                                                                                  |
| **`Proposal.declinedAt`**      | One-shot timestamp.                                                                                                                                                                                                                                                                                                                       |
| **`SentEmail.revision`**       | Which revision each email delivered.                                                                                                                                                                                                                                                                                                      |
| **`status` values**            | `changes_requested` and `declined`, lowercase strings defined once in `src/lib/schemas/proposal.ts` (no DB enums, per existing decision).                                                                                                                                                                                                 |

Rules:

- **Repeatable events have no timestamp column.** `sentAt`, `approvedAt`, `paidAt`, `declinedAt` happen at most once. `Proposal.sentAt` keeps meaning "first sent"; each revision carries its own `sentAt`.
- **Working copy equals latest revision** in `sent`, `approved` and `paid`. It may differ in `draft` and `changes_requested` (editable), and in `declined`, where the concierge may hold unsent edits made before the member declined. Those edits are kept but never shown: the builder and preview render the latest revision.
- **Append-only.** No update or delete path for `ProposalRevision` or `ProposalMessage`.
- **Snapshot compatibility.** Revisions are immutable but the item schema is not. Each snapshot stores a `schemaVersion`, reads go through one upgrade function, and later schema changes to items must be backward compatible (new fields optional with a default). A snapshot that fails to parse is a logged `INTERNAL_ERROR`, never a silent blank page.
- **Ordering.** Entries sort by `(createdAt, id)`. This is stable but not strictly causal within one millisecond (cuid ids are not time-ordered to that precision). Acceptable in a single process, where each transition writes exactly one entry per transaction; the backfill uses the distinct existing timestamps.
- **`lastActivityAt`** is derived: `updatedAt` for a draft, the newest entry's `createdAt` for a sent proposal.
- **Seed (SHOULD).** One demo proposal in `changes_requested` with a short conversation, so a reviewer sees the feature without clicking through the loop.

## D. Edge cases

| #    | Situation                                                               | Expected behavior                                                                                                                                                                 |
| ---- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E-1  | Member approves while another tab (or a stale page) requests changes    | Exactly one wins by conditional write. The loser gets `INVALID_TRANSITION`, refetches and converges. No orphan entry.                                                             |
| E-2  | Member acts on revision 1 after the concierge resent revision 2         | `STALE_REVISION`, nothing written. The UI shows the banner. Typed text is kept.                                                                                                   |
| E-3  | Two concierge tabs resend at once                                       | One creates revision N+1. The other gets `INVALID_TRANSITION` (status is already `sent`). The unique constraint is the backstop.                                                  |
| E-4  | Member declines while the concierge is editing                          | The concierge's next save returns `NOT_EDITABLE`. The builder switches to the latest revision, read-only, with the decline reason. Unsent edits stay in the database, not shown.  |
| E-5  | A chat message is posted as the status becomes `paid`                   | Either order is valid. If it loses, `CONVERSATION_CLOSED` and the text stays in the composer.                                                                                     |
| E-6  | Resend with zero items                                                  | `EMPTY_PROPOSAL` (422). Full rollback: no revision, no email, no entry.                                                                                                           |
| E-7  | Resend with unchanged content                                           | Allowed. Labeled "No itinerary changes".                                                                                                                                          |
| E-8  | Response lost after a successful chat post, then retry                  | Same `clientId` and payload: the server returns the existing entry, even if the conversation closed in between. Same `clientId` with a different payload: `IDEMPOTENCY_CONFLICT`. |
| E-9  | Member opens the link in `changes_requested` before any concierge reply | Sees the last revision, their own request and "Your concierge is working on it".                                                                                                  |
| E-10 | The revision 1 email is opened after revision 2 exists                  | Same URL, shows the latest revision. Correct by design.                                                                                                                           |
| E-11 | Whitespace-only, empty or 2001-character body                           | `VALIDATION_ERROR`. Nothing written.                                                                                                                                              |
| E-12 | Member posts to a `draft`                                               | `CONVERSATION_CLOSED`. The list endpoint returns empty.                                                                                                                           |
| E-13 | Two entries in the same millisecond                                     | Ordered by id as the tiebreak. Stable across refetches, not guaranteed causal (see [C](#c-data-model-details)).                                                                   |
| E-14 | Declined proposal, concierge wants to continue                          | Create a new proposal for the reservation. No link between the two conversations (non-goal).                                                                                      |
| E-15 | Response lost after a successful transition, then the client retries    | The retry is `INVALID_TRANSITION` (repeating a status is an error by design). The UI refetches; if the status now equals the target it shows the success state, not an error.     |
| E-16 | The conversation already holds 500 chat entries                         | Chat posts get `CONVERSATION_CLOSED`. Every transition still succeeds and still writes its entry, because transition entries are exempt from the cap.                             |

## E. Decisions and alternatives

Each is a candidate entry for [decisions.md](../../decisions.md).

| ID   | Decision                                                                                                                                             | Alternatives rejected                                                             | Why                                                                                                                                                                                                            |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1  | Two member actions: **request changes** (loops) and **decline** (terminal)                                                                           | One "decline with message" that always loops; changes-only                        | The business outcomes differ (negotiate vs. lost deal). One status per outcome keeps reporting honest.                                                                                                         |
| D-2  | **Immutable revisions** under one proposal and one link                                                                                              | New proposal with `supersedesId` (new link, cluttered list); edit `sent` in place | One URL for the member, full history for the concierge, immutability intact.                                                                                                                                   |
| D-3  | Conversation **per proposal**                                                                                                                        | Per reservation                                                                   | Entries relate to a revision and a lifecycle. A per-reservation chat needs cross-proposal rules.                                                                                                               |
| D-4  | **Polling**                                                                                                                                          | SSE/WebSocket                                                                     | No long-lived-connection infrastructure, no auth to scope a channel. 5 s latency is fine here. Revisit if a real backend appears.                                                                              |
| D-5  | Revision snapshot stored as **serialized items with a `schemaVersion`**; the change summary compares full item content                               | Items table with `revisionId`; true per-item diff                                 | Snapshots never change and are never queried by field, so a second items table buys nothing. The version covers future schema changes. Item ids are unstable by design, so an edit shows as "removed + added". |
| D-6  | **Dedicated verbs** for transitions with a payload or side effect; `PATCH` stays for payload-less member moves                                       | Overload `PATCH` with a body per status                                           | Same principle as `sent` only via `/send`: side effects can't be skipped.                                                                                                                                      |
| D-7  | `currentRevision` on `Proposal`; every member write is `updateMany where { id, status, currentRevision }`; a 0-row result is classified by a re-read | Read the latest revision, then write                                              | One atomic statement, no read-then-write window. The re-read only picks the error to report, never whether to write. The cost is a denormalized counter, guarded by an invariant test.                         |
| D-8  | **Member reads the latest revision**, not the working copy                                                                                           | Member reads the working copy                                                     | After a request the concierge edits; the member must not watch a half-edited itinerary.                                                                                                                        |
| D-9  | Repeatable events live in the conversation and revisions; one-shot ones stay as columns                                                              | A timestamp column per status                                                     | `changes_requested` repeats. Columns would silently keep only the last one.                                                                                                                                    |
| D-10 | Resend of **unchanged** content is allowed                                                                                                           | Reject with `NO_CHANGES`                                                          | Without it the loop dead-ends when the answer is "we can't change that". The concierge explains in the cover message and the member decides.                                                                   |
| D-11 | Request and decline messages are **mandatory**                                                                                                       | Optional reason                                                                   | A decline with no reason teaches the business nothing; a request with no text is meaningless. The friction is the point.                                                                                       |
| D-12 | Chat messages are **optimistic** with `clientId` idempotency                                                                                         | Pessimistic like other creates                                                    | Chat that waits on the network feels broken. The server adds only id and timestamp, so rollback is trivial.                                                                                                    |
| D-13 | The 500 cap counts **chat entries only**                                                                                                             | Cap all entries; reserve headroom for transitions                                 | Transition entries are bounded by the state machine, and a status change must never fail because of chat volume. A flooded chat can't hold a deal hostage.                                                     |
| D-14 | `declined` is **excluded** from the working-copy invariant                                                                                           | Reset the working copy to the latest revision when declining                      | Resetting destroys the concierge's unsent work for no benefit. Keeping it is harmless because the builder and preview render the latest revision.                                                              |

## F. Surface behavior details

### Member

- **Request changes and Decline share one sheet**, with a mandatory message and a different heading and button. Decline asks for explicit confirmation; one tap must not end a deal.
- **The conversation** opens as a bottom sheet on mobile and a side panel on wide screens. Concierge entries show the signature; the member's own entries show "You". Until a concierge entry exists the concierge is "Your concierge", in the status line and everywhere else.
- **`declined`** shows a quiet closing page with the date and a read-only conversation. It reveals nothing beyond what the member already saw.
- **Stale protection.** The banner "A new version is ready" appears whenever the client learns of a newer revision: a refetch (mount, focus), a `STALE_REVISION` response, or polling (P2). Actions stay disabled until the member opens it. A rejected action never clears the member's typed text.

### Concierge

- **Reply & resend dialog:** cover message (required), signature (required, prefilled from the last one used, kept in browser-local storage as a convenience, never as source of truth) and the change summary against the previous revision. An unchanged itinerary is labeled as such.
- **Pending request (pinned):** the latest `changes_requested` entry plus every member chat entry after it, until the next resend. A clarification in chat ("Tuesday afternoon, not morning") therefore reaches the concierge next to the original request.
- **Conversation tab** beside the builder; the composer has a signature field.
- **Revisions list (P2):** each revision with date, summary and a read-only view.
- **Preview** renders the working copy in `draft` and `changes_requested`, which is exactly what the member will see after sending. In every other status it renders the latest revision. One rule, no ambiguity.

### Optimistic updates

Extends [proposal-lifecycle.md](../../proposal-lifecycle.md), which today limits optimism to send, approve and pay.

| Operation                        | Optimistic                                                                   | Rendered from the server response                                              |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Request changes, decline, resend | Status badge only                                                            | The new conversation entry, the success state, and for resend the new revision |
| Chat message                     | Appears immediately as _pending_ with its `clientId`, reconciled on response | Final id and timestamp                                                         |
| Chat failure                     | Marked _failed_ with **Retry**, which reuses the same `clientId`             |                                                                                |

Rollback, refetch on `INVALID_TRANSITION` and `STALE_REVISION`, and invalidate-on-settle work as in the lifecycle doc. When a retried transition returns `INVALID_TRANSITION` and the refetched status already equals the target, the UI shows success ([E-15](#d-edge-cases)). Chat is the one create operation allowed to be optimistic, because the server adds only an id and a timestamp to what the user typed.

### Polling and freshness

- **P1 baseline:** every query refetches on mount and window focus (TanStack Query defaults), including the concierge's proposals list and open proposal.
- **P2 polling:** every **5 s** while the tab is visible, for the member's conversation and latest revision number, and for the concierge's open conversation, open proposal and proposals list. Stops for a conversation once it is closed.
- Pause when hidden, back off to 30 s after repeated errors.
- Built on TanStack Query's refetch interval. No `useEffect` is needed.

## G. Security, accessibility, performance

### Security and abuse

The app has no authentication; the unguessable proposal id is the member's access, and the dashboard is open. This feature **widens what that access allows**, and the spec says so plainly.

- **Before this feature**, a `sent` proposal was immutable and `NOT_EDITABLE`, so a member link could do nothing but approve and pay.
- **After it**, `PUT` is allowed in `changes_requested` and `POST /resend` is not role-gated. Anyone holding a member link can therefore edit itinerary content and prices, resend under any signature, and then approve the result, and the system records it as a legitimate concierge revision that the member approved. This is the same accepted trust model as the open dashboard, now covering **content and money**, not only chat labels.
- **Accepted for this scope, not for production.** Production needs real authentication, a server-derived role, role-gated routes (members cannot call `PUT` or `resend`) and signed expiring links.
- **The member's name is never client-supplied** ([FR-11](spec.md#2-requirements)). The concierge's is, because no concierge identity exists. The signature is a display label, and the UI must not present it as verified.
- **XSS:** plain text, escaped on render. No HTML or Markdown rendering, no link auto-embedding.
- **Abuse limits:** 2000 characters per entry, 500 chat entries per conversation. Transition entries are exempt so the cap cannot freeze a deal ([D-13](#e-decisions-and-alternatives)). Rate limiting is out of scope.
- **Information leak:** a draft's conversation returns an empty list and the member page keeps its "not available" behavior.

### Accessibility

- The entry list is `role="log"` with polite live updates; the new-version banner is `role="status"`.
- Sheets and dialogs trap focus, close on Esc and return focus to their trigger.
- The composer has a visible label. Enter inserts a newline; Cmd/Ctrl+Enter or the button sends.
- Motion respects `prefers-reduced-motion`. Text contrast at least AA. Touch targets at least 44 px.

### Performance

- A full conversation is small enough to refetch whole: at most 500 chat entries plus a handful of transition entries, all plain text. Incremental sync would add cursor logic for no measurable gain.
- No polling while hidden or closed, so idle tabs cost nothing.

## H. Acceptance criteria

```gherkin
AC-1  Given a sent proposal at revision 1
      When the member requests changes with "Move the spa to Tuesday"
      Then the status is changes_requested
      And the conversation ends with a changes_requested entry from the member containing that text

AC-2  Given a proposal in changes_requested and the concierge has edited the working copy
      When the member loads the proposal
      Then the member sees revision 1, not the edited items

AC-3  Given the member is viewing revision 1 and the concierge has resent revision 2
      When the member approves with revision 1
      Then the response is 409 STALE_REVISION and the status is unchanged
      And if the status were also not a legal source, the response is INVALID_TRANSITION instead

AC-4  Given a proposal in changes_requested with at least one item
      When the concierge resends with a cover message and a signature
      Then revision 2 exists, the status is sent, a SentEmail for revision 2 exists
      And a revision_sent entry with the signature is appended

AC-5  Given a proposal in changes_requested with no items
      When the concierge resends
      Then the response is 422 EMPTY_PROPOSAL and no revision, email or entry exists

AC-6  Given a resend whose items equal revision 1
      Then it succeeds and the change summary reports "no changes"

AC-7  Given revision 2 differs from revision 1 by one added item
      Then the summary lists that item as added and shows the total difference

AC-8  Given a paid or declined proposal
      When anyone posts a chat message
      Then the response is 409 CONVERSATION_CLOSED and the conversation is unchanged

AC-9  Given a chat message was posted with clientId X
      When the same request is repeated
      Then no second entry exists and the original entry is returned

AC-10 Given two simultaneous resend requests
      Then exactly one succeeds and the revision numbers are unique and contiguous

AC-11 Given the member is on revision 1 and the client learns of revision 2
      (by refetch on focus, a STALE_REVISION response, or polling)
      Then a banner appears and Approve stays disabled until the member opens revision 2

AC-12 Given existing proposals sent, approved and paid before this feature
      When the migration runs
      Then each has revision 1 equal to its items, currentRevision 1 and matching events

AC-13 Given a sent proposal at revision 1
      When the member declines with "Plans changed"
      Then the status is declined, declinedAt is set, and a declined entry with that text is appended
      And a later request-changes, decline or approve returns INVALID_TRANSITION

AC-14 Given a proposal in changes_requested and the concierge has changed an item's price in the working copy
      When the member declines
      Then the status is declined and revision 1 is unchanged
      And the builder and preview show revision 1, not the unsent price

AC-15 Given a resend of revision 2 with cover message "Moved the spa" signed "Maya"
      Then the SentEmail body preview contains "Revision 2", "Moved the spa", "Maya"
      And the absolute proposal link

AC-16 Given a conversation holding 500 chat entries
      When anyone posts a chat message
      Then the response is 409 CONVERSATION_CLOSED
      And approve, pay, request changes, decline and resend still succeed and append their entries

AC-17 Given a chat body of "<b>hi</b>\nthere"
      Then it is stored and returned exactly as typed
      And it renders as literal text with the line break preserved
      And a whitespace-only body or a 2001-character body returns 400 VALIDATION_ERROR

AC-18 Given a member posts a chat message
      Then its authorName equals the member's name from the database
      And a member request that includes authorName returns 400 VALIDATION_ERROR
      And a concierge request without authorName returns 400 VALIDATION_ERROR

AC-19 Given a chat message was posted with clientId X and the proposal then became paid
      When the same request is replayed
      Then the original entry is returned
      And a replay with the same clientId and a different body returns 409 IDEMPOTENCY_CONFLICT

AC-20 Given the member's tab is visible on revision 1
      When the concierge resends revision 2
      Then the banner appears within 10 seconds without any user action

AC-21 Given a proposal in changes_requested and the member wrote "Tuesday afternoon, not morning" in chat after the request
      Then the concierge's pinned block shows the request and that chat entry

AC-22 Given a chat message is sent while the network fails
      Then it shows as failed with Retry
      And retrying reuses the clientId and produces exactly one entry

AC-23 Given revisions 1 and 2 exist
      When the concierge opens revision 1
      Then it renders read-only as an immutable snapshot
      And opening revision 2 also shows its change summary against revision 1
```

## I. Test plan and traceability

Levels: **U** unit (pure code), **A** API (real route handlers against the throwaway SQLite, asserting responses and rows), **H** hook or component. Every FR and every edge case appears below.

### Requirements

| Requirement | Acceptance criteria | Level | Test focus                                                                                                                                                                       |
| ----------- | ------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1, FR-2  | AC-1, AC-13, AC-14  | U, A  | **Every (from, to) pair** of the 6 statuses asserted legal or illegal. Extends `state-machine.test.ts`. Message required on both.                                                |
| FR-3        | AC-4, AC-5, AC-6    | A     | `PUT` allowed in `draft` and `changes_requested`, `NOT_EDITABLE` elsewhere; resend rules; unchanged resend succeeds.                                                             |
| FR-4, FR-5  | AC-2, AC-4          | A     | One revision per send. The member endpoint returns the latest revision even while the working copy differs.                                                                      |
| FR-6        | AC-3                | A     | `STALE_REVISION` on every member action with **no row changes**. 0-row result is re-read and classified in check order.                                                          |
| FR-7        | AC-7                | U     | Change-summary function: added, removed, total difference, unchanged, edited item as removed + added.                                                                            |
| FR-8        | AC-1, AC-4, AC-13   | U, A  | Stream ordering, transition entries written with the transition, drafts have none.                                                                                               |
| FR-9        | AC-8                | A     | Open or closed per status, one shared function.                                                                                                                                  |
| FR-10       | AC-16, AC-17        | A, H  | Length limits, plain text stored verbatim, escaped on render, chat-only cap, transitions exempt.                                                                                 |
| FR-11       | AC-18               | A     | Member name from the database, `authorName` rules per author.                                                                                                                    |
| FR-12       | AC-9, AC-19, AC-22  | A, H  | Replay returns the original, replay after close, payload conflict, client retry reuses the id.                                                                                   |
| FR-13       | AC-20               | H     | Fake timers: new revision or entry reaches the other side within 10 s; polling pauses when hidden and stops when closed.                                                         |
| FR-14       | AC-11               | H     | Banner on refetch, on `STALE_REVISION`, on polling; actions disabled until opened.                                                                                               |
| FR-15       | AC-4, AC-21         | H     | Pending request block includes later member chat; resend dialog shows the summary; list shows new statuses, revision, last activity.                                             |
| FR-16       | AC-15               | A     | Email body preview contains revision, cover message, signature, absolute link.                                                                                                   |
| FR-17       | AC-22               | H     | Optimistic chat reconciles; failure shows Retry; status badge optimistic and rolls back.                                                                                         |
| FR-18       | AC-23               | A, H  | Revision list and single revision; read-only view.                                                                                                                               |
| Invariants  | AC-2, AC-14         | A     | `currentRevision` equals the highest revision number. Working copy equals latest revision in `sent`, `approved`, `paid`, asserted after every transition. `lastActivityAt` rule. |
| Migration   | AC-12               | A     | Backfill produces revision 1 and matching entries for existing non-draft proposals.                                                                                              |

### Edge cases

| Edge case | Covered by              | Level | Notes                                                                                                                  |
| --------- | ----------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| E-1       | AC-3                    | A     | **Concurrent** approve vs. request-changes: one 200, one 409, one entry. Extends the existing concurrent-approve test. |
| E-2       | AC-3, AC-11             | A, H  | Stale approve, request, decline; typed text kept.                                                                      |
| E-3       | AC-10                   | A     | Concurrent resend: one revision created, no duplicate number.                                                          |
| E-4       | AC-14                   | A, H  | Decline during editing: next save `NOT_EDITABLE`, builder shows the latest revision.                                   |
| E-5       | AC-8                    | A     | Either ordering is valid; the loser gets `CONVERSATION_CLOSED`.                                                        |
| E-6       | AC-5                    | A     | Rollback leaves no revision, email or entry.                                                                           |
| E-7       | AC-6                    | A     | Unchanged resend succeeds.                                                                                             |
| E-8       | AC-9, AC-19             | A     |                                                                                                                        |
| E-9       | AC-2                    | H     | Member sees the last revision, the request and the "Your concierge" fallback.                                          |
| E-10      | AC-2                    | A     | Same URL returns the latest revision.                                                                                  |
| E-11      | AC-17                   | A     |                                                                                                                        |
| E-12      | AC-8                    | A     | Post to a draft; list returns empty.                                                                                   |
| E-13      | FR-8 ordering test      | U     | Same-millisecond entries sort by id and stay stable across reads.                                                      |
| E-14      | existing proposal tests | A     | Creating a new proposal for the reservation is existing behavior; no new test.                                         |
| E-15      | AC-13                   | H     | Retried transition: `INVALID_TRANSITION`, then refetch, then success shown when status equals target.                  |
| E-16      | AC-16                   | A     | Transitions succeed at the cap.                                                                                        |

## J. Docs to update

Per `AGENTS.md`, behavior changes update the matching doc in the same change.

| Doc                     | Update                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `proposal-lifecycle.md` | Six statuses, the edge table, editable statuses, the revision guard and error classification, the widened optimistic rule            |
| `data-model.md`         | New entities, the working-copy vs. revision rule (and the `declined` exception), the repeatable-event rule, snapshot versioning      |
| `api.md`                | New routes, the changed `PATCH` and `PUT` rules, new error codes and check order, `lastActivityAt`                                   |
| `design.md`             | Member bar and sheets, conversation panel, the concierge's signature replacing "Your concierge", preview rule                        |
| `product.md`            | "Proposal versioning" leaves out-of-scope. "Cancellation" is partly delivered (decline); expiry stays out. Add the new capabilities. |
| `decisions.md`          | D-1 to D-14                                                                                                                          |

## K. Rollout and migration

One migration, no feature flag (single process, no external consumers).

1. Create `ProposalRevision` and `ProposalMessage`. Add `Proposal.currentRevision` (default 0), `Proposal.declinedAt`, `SentEmail.revision`.
2. **Backfill** every proposal that is not a `draft`: revision 1 from the current note and items (schema version 1), `currentRevision = 1`, and entries for `sent` (at `sentAt`) plus `approved` and `paid` where their timestamps exist. Set `SentEmail.revision = 1`.
3. Deploy code that reads the member page from revisions.

The old `PATCH` body had no `revision`, so the member client and the route ship together. Rollback is a code revert: the new tables and columns are additive and harmless to the old code.

## L. Implementation slices

Each slice leaves `npm run check` green and is shippable alone. A `plan.md` would expand them with files and tasks. Slices 1–9 deliver all of P1 and nothing that depends on P2.

**P1**

1. Schema, migration, backfill, seed.
2. State machine as an edge list, with the exhaustive pair test.
3. Revisions on send; the member page reads the latest revision.
4. Revision guard on `PATCH` (`STALE_REVISION`) and error classification.
5. Request changes and decline.
6. Resend, email and the change-summary function.
7. Conversation read (the stream that records transitions).
8. Member UI: request and decline sheet, "new version" banner driven by refetch.
9. Concierge UI: conversation tab, pending request, resend dialog, list updates.

**P2**

10. Chat posting, with idempotency, the closed rule and the chat-only cap.
11. Polling for member and concierge.
12. Revision browsing for the concierge.
