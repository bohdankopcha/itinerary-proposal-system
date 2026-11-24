# Spec 001: Revision requests and proposal conversation

|                    |                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**         | Draft, ready for review                                                                                                                                                                                |
| **Author**         | Bohdan Kopcha                                                                                                                                                                                          |
| **Date**           | 2026-11-24                                                                                                                                                                                             |
| **Implementation** | None yet. This document is the contract. Once built, behavior moves into the product docs and this file stays as the record ([appendix J](appendix.md#j-docs-to-update)).                              |
| **How to read**    | **At a glance**: 2 minutes. **Sections 1–7**: 10 minutes. [**Appendix**](appendix.md): reference (full edge cases, all decisions, acceptance tests, traceability, migration), read only what you need. |

---

## At a glance

**Problem.** A member can only say yes. A `sent` proposal is approved and paid, or it sits there. Real concierge work is a negotiation: move the spa to Tuesday, drop the excursion, ask about a dietary need.

**Feature.** Turn the one-way flow into a loop with a paper trail:

- The member can **request changes** or **decline**, always with a message.
- The concierge edits and **resends** a numbered **revision** with a cover message and a signature.
- Every proposal gets a **conversation**: messages from both sides and the proposal's own events in one chronological stream, shown in a chat-style window to both.

The central idea: **a revision is what the member approves; the conversation is the history of how it got there.** Both are append-only, so "the member approves exactly what they saw" survives the new flow.

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> sent: concierge, send (rev 1)
    sent --> approved: member, approve
    sent --> changes_requested: member, request changes
    sent --> declined: member, decline
    changes_requested --> sent: concierge, resend (rev N+1)
    changes_requested --> declined: member, decline
    approved --> paid: member, pay
    paid --> [*]
    declined --> [*]
```

**Six things worth a look** (the non-obvious parts):

1. **Stale-revision guard.** A member on revision 1 can't approve after the concierge resent revision 2. Every member action carries the revision the member is _displaying_; a mismatch is `409 STALE_REVISION` and writes nothing.
2. **The member reads one consistent response for the latest sent revision, never the working copy.** While the concierge edits after a request, the member never sees a half-edited itinerary, and status and itinerary can't come from two different moments.
3. **Every guard is one atomic statement.** `currentRevision` lives on the proposal, so a member action is `updateMany where { id, status, currentRevision }`. Edits and resends write their status condition first, so they can't interleave either. A failed write is classified afterwards by a re-read.
4. **Every transition writes its conversation entry in the same transaction.** A status can't change without its entry, or the reverse. Transition entries are exempt from the chat cap, so a flooded chat can never block a deal.
5. **The transition table becomes an edge list.** Today it maps one status to one successor and can't branch. UI buttons are still derived from it, now by actor.
6. **Resending unchanged content is allowed.** Otherwise the loop dead-ends on "we can't change that".

**Scope.** **P1** is the minimum coherent feature: request changes, decline, revisions, resend, the change summary, the conversation stream with chat posting, and the member's "new version" banner (driven by refetch). **P2** completes it: polling, optimistic chat with idempotency, revision browsing. Not doing: real-time delivery, unread counters, message edit/delete, real authentication ([appendix A](appendix.md#a-non-goals)).

---

## 1. Scenarios

| ID   | As a      | I want to                                                     | So that                                                | Pri |
| ---- | --------- | ------------------------------------------------------------- | ------------------------------------------------------ | --- |
| US-1 | member    | ask for changes, or decline, with a note                      | the itinerary fits what I want, or I can leave cleanly | P1  |
| US-2 | concierge | see the request next to the itinerary and resend with my name | the member knows what changed and who answered         | P1  |
| US-3 | member    | be protected from approving a version I haven't seen          | I never pay for a surprise                             | P1  |
| US-4 | both      | exchange short messages                                       | small questions don't need a new revision              | P1  |
| US-5 | concierge | open any earlier revision                                     | I can answer "what did I offer last time?"             | P2  |

Terms used below: **working copy** (the note and items the concierge edits), **revision** (an immutable snapshot taken at every send, numbered from 1, carrying that send's cover message and signature), **conversation** (the proposal's ordered, append-only list of **entries**). Entry kinds are in [appendix B](appendix.md#b-entry-kinds).

## 2. Requirements

Keywords follow RFC 2119. Every requirement and edge case is traced to a test in [appendix I](appendix.md#i-test-plan-and-traceability).

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                                                                                    | Pri |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-1  | A member MUST be able to request changes on a `sent` proposal with a message (1–2000 characters after trim). Status becomes `changes_requested`.                                                                                                                                                                                                                                                               | P1  |
| FR-2  | A member MUST be able to decline a `sent` or `changes_requested` proposal with a message (same limits). Status becomes `declined`, terminal.                                                                                                                                                                                                                                                                   | P1  |
| FR-3  | In `changes_requested` the concierge MUST be able to edit note and items (same validation as a draft) and resend: at least one item, a cover message (1–2000), a signature (1–60). One transaction creates revision N+1 (storing the cover message and signature on it), sets `sent`, logs the email and appends the entry. Unchanged content is allowed.                                                      | P1  |
| FR-4  | Every send MUST create an immutable revision. No code path updates or deletes one.                                                                                                                                                                                                                                                                                                                             | P1  |
| FR-5  | The member page MUST read one consistent response from `GET …/revisions/latest`: status, revision number, snapshot, cover message, signature and change summary, all read in one transaction. It never reads the working copy.                                                                                                                                                                                 | P1  |
| FR-6  | Every member transition (approve, pay, request changes, decline) MUST carry the revision the member is displaying. If it is not the latest, reject with `STALE_REVISION` and write nothing.                                                                                                                                                                                                                    | P1  |
| FR-7  | A change summary against the previous revision MUST come from one pure function: items added and removed (compared as a multiset on full item content, order ignored), the total difference, and whether the note changed. Labels: "No itinerary changes" when the items are equal, plus "Note updated" when the note differs.                                                                                 | P1  |
| FR-8  | A sent proposal MUST have exactly one conversation (a draft has none): chat entries, transition entries and system events in one stream ordered by `(createdAt, id)`. Entries are immutable.                                                                                                                                                                                                                   | P1  |
| FR-9  | Member and concierge MUST be able to post chat entries while the conversation is open (`sent`, `changes_requested`, `approved`); it is read-only in `paid` and `declined`. One pure function, `canPostChat(status, chatEntryCount)`, decides, shared by server and UI.                                                                                                                                         | P1  |
| FR-10 | Entry text MUST be plain text: escaped on render, line breaks preserved, never HTML or Markdown. Max 2000 characters per entry. A conversation holds at most 500 **chat** entries; transition entries and system events are exempt, so a full conversation never blocks a status change.                                                                                                                       | P1  |
| FR-11 | A concierge entry MUST store its signature as typed. A member entry (chat or transition) MUST take the member's name from the database, never from the request.                                                                                                                                                                                                                                                | P1  |
| FR-12 | Posting a chat entry SHOULD be idempotent per client-generated id. A replay with the same payload returns the existing entry, even if the conversation has since closed, and a concurrent duplicate is treated as a replay. A replay with a different payload is `IDEMPOTENCY_CONFLICT`.                                                                                                                       | P2  |
| FR-13 | While a tab is visible, these MUST refresh within 10 seconds: for the member, the conversation and the latest revision number; for the concierge, the open conversation, the open proposal and the proposals list. Without polling (P1), the same data refetches on mount and window focus.                                                                                                                    | P2  |
| FR-14 | Member page: a conversation sheet, **Request changes** and **Decline**, a change summary on revisions 2 and later, and a "new version" banner. The client keeps `displayedRevision` apart from the latest revision it knows. It renders and acts on the displayed one. When a newer one is known (refetch, `STALE_REVISION`, polling), the banner appears and actions stay disabled until the member opens it. | P1  |
| FR-15 | Concierge dashboard: a Conversation tab, the member's pending request pinned above the builder (the latest request plus the member's chat entries after it), a **Reply & resend** dialog showing the change summary, and a list with the new statuses, revision number and last activity.                                                                                                                      | P1  |
| FR-16 | The resend email preview MUST contain the revision number, the cover message, the signature and the absolute proposal link.                                                                                                                                                                                                                                                                                    | P1  |
| FR-17 | Chat is optimistic: a message appears immediately as pending and reconciles on the response ([appendix F](appendix.md#f-surface-behavior-details)). Until then (P1) it is sent and shown after the response.                                                                                                                                                                                                   | P2  |
| FR-18 | The concierge MUST be able to open any revision read-only (revision list and single revision).                                                                                                                                                                                                                                                                                                                 | P2  |
| FR-19 | Edits and resends MUST be race-safe. `PUT` and `resend` write their status condition first (`status in (draft, changes_requested)` and `status = changes_requested`), then touch items in the same transaction. A resend snapshots the items it reads after that write. A concurrent resend can never leave the working copy different from the latest revision in `sent`.                                     | P1  |

## 3. State machine

| #   | From → To                        | Actor     | Via                      | Preconditions                      | Side effects (one transaction)                                                                       |
| --- | -------------------------------- | --------- | ------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| T1  | `draft` → `sent`                 | Concierge | `POST …/send`            | ≥ 1 item                           | Revision 1, `currentRevision = 1`, `sentAt`, `SentEmail`, `sent` entry                               |
| T2  | `sent` → `approved`              | Member    | `PATCH …`                | `revision` is latest               | `approvedAt`, `approved` entry                                                                       |
| T3  | `sent` → `changes_requested`     | Member    | `POST …/request-changes` | `revision` is latest, message      | `changes_requested` entry                                                                            |
| T4  | `sent` → `declined`              | Member    | `POST …/decline`         | `revision` is latest, message      | `declinedAt`, `declined` entry                                                                       |
| T5  | `changes_requested` → `sent`     | Concierge | `POST …/resend`          | ≥ 1 item, cover message, signature | Revision N+1 with cover message and signature, `currentRevision`, `SentEmail`, `revision_sent` entry |
| T6  | `changes_requested` → `declined` | Member    | `POST …/decline`         | `revision` is latest, message      | as T4. The working copy is left untouched ([section 4](#4-data-model))                               |
| T7  | `approved` → `paid`              | Member    | `PATCH …`                | `revision` is latest               | `paidAt`, `paid` entry                                                                               |

Everything else is illegal, including repeating the current status (`409 INVALID_TRANSITION`, as today).

| Status              | Editable               | Visible to member | Conversation | Terminal |
| ------------------- | ---------------------- | ----------------- | ------------ | -------- |
| `draft`             | yes                    | no                | none         | no       |
| `sent`              | no                     | latest revision   | open         | no       |
| `changes_requested` | **yes** (working copy) | latest revision   | open         | no       |
| `approved`          | no                     | latest revision   | open         | no       |
| `paid`              | no                     | latest revision   | read-only    | **yes**  |
| `declined`          | no                     | latest revision   | read-only    | **yes**  |

**Code model.** `TRANSITIONS` becomes a list of edges `{ from, to, actor, verb }`; `canTransition`, `isEditable` (now `draft` and `changes_requested`) and each surface's buttons derive from it. `PATCH` keeps only the payload-less member edges (approve, pay). The rest get dedicated verbs, for the same reason `sent` is reachable only through `/send`: an action with a payload or side effect must not be skippable.

**The race the design must win:**

```mermaid
sequenceDiagram
    participant M as Member (displays rev 1)
    participant S as Server
    participant C as Concierge
    C->>S: resend (changes_requested, rev 1)
    S-->>C: rev 2 created, status sent
    M->>S: approve (revision 1)
    S-->>M: 409 STALE_REVISION, nothing written
    M->>S: GET latest
    S-->>M: rev 2 plus change summary
    Note over M: banner shows, rev 1 stays on screen, actions re-enabled after the member opens rev 2
```

## 4. Data model

Conceptual; exact columns live in `prisma/schema.prisma` once built ([details: appendix C](appendix.md#c-data-model-details)).

| Change                     | Purpose                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| New `ProposalRevision`     | Immutable snapshot per send: note, items, **cover message and signature** (empty for revision 1), schema version. Unique on `(proposalId, number)`. |
| New `ProposalMessage`      | One conversation entry: kind, author role and name, body, the revision it is about, optional `clientId`.                                            |
| `Proposal.currentRevision` | Denormalized on purpose: it makes the stale guard one atomic statement. Invariant: equals the highest revision number.                              |
| `Proposal.declinedAt`      | One-shot timestamp, like `approvedAt` and `paidAt`.                                                                                                 |
| `SentEmail.revision`       | Which revision each email delivered.                                                                                                                |

Two rules:

- **Repeatable events** (changes requested) live in the conversation, because a timestamp column would silently keep only the last one.
- **Working copy vs. revision.** In `sent`, `approved` and `paid` the working copy equals the latest revision, asserted by a test after every transition. `declined` is excluded: a member can decline while the concierge holds unsent edits, and destroying them would be lossy for no benefit. Those edits stay in the database but are never shown; the builder and preview of a declined proposal render the latest revision.

## 5. API

Contracts are zod schemas in `src/lib/schemas/`. Intent only here.

| Method and path                                | Purpose                                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /api/proposals/[id]/messages`             | Conversation, oldest first. Empty for a draft.                                                                                                   |
| `POST /api/proposals/[id]/messages`            | Post a chat entry. `author: concierge` requires `authorName` (1–60). `author: member` forbids it (`VALIDATION_ERROR`). Optional `clientId` (P2). |
| `POST /api/proposals/[id]/request-changes`     | T3. Body: `revision`, `body`                                                                                                                     |
| `POST /api/proposals/[id]/decline`             | T4, T6. Body: `revision`, `body`                                                                                                                 |
| `POST /api/proposals/[id]/resend`              | T5. Body: `authorName`, `body`                                                                                                                   |
| `GET /api/proposals/[id]/revisions/[revision]` | The member view of one revision (a number or `latest`). The member page reads `latest` (P1).                                                     |
| `GET /api/proposals/[id]/revisions`            | Revision list with change summaries (P2)                                                                                                         |

**Member view** (the response of `…/revisions/[revision]`), read in one transaction so status and itinerary can never come from two moments: proposal-level `status`, `currentRevision`, `approvedAt`, `paidAt`, `declinedAt`, reservation and member name, plus the `revision` itself (number, note, items, total, `sentAt`, cover message, signature, change summary against the previous one, absent for revision 1). A revision segment that is neither a number nor `latest` is `400`. An unknown number, or `latest` on a draft, is `404`, the same as an unknown proposal, so a draft leaks nothing.

Existing routes:

- `PATCH` gains a required `revision`. Its status enum widens to all six values; the domain rejects any target that is not a member `PATCH` edge with `409 INVALID_TRANSITION`, as it rejects `sent` today. Only an unknown value is `400`.
- `PUT` is allowed in `draft` and `changes_requested`. It is a conditional write (see below).
- Detail and summaries gain `currentRevision` and `lastActivityAt`. **`lastActivityAt`** is the proposal's `updatedAt` for a draft and the newest entry's `createdAt` for anything sent (every transition writes an entry, so it is never null once sent).
- `GET /api/proposals/[id]` remains the concierge's working-copy endpoint. The member page must not use it. With no authentication this is enforced by tests, not by access control ([appendix G](appendix.md#g-security-accessibility-performance)).

| HTTP | Code                   | When                                                                             |
| ---- | ---------------------- | -------------------------------------------------------------------------------- |
| 409  | `STALE_REVISION`       | A member action carries a revision that is not the latest. Names both numbers.   |
| 409  | `CONVERSATION_CLOSED`  | Posting chat where the conversation is not open (draft, `paid`, `declined`).     |
| 409  | `CONVERSATION_FULL`    | Posting chat when 500 chat entries exist. Separate code so the UI can say which. |
| 409  | `IDEMPOTENCY_CONFLICT` | A `clientId` is replayed with a different body or author.                        |

**Guards and error classification.** The guard is the write itself: `updateMany where { id, status, currentRevision }`. When it changes 0 rows, the server re-reads and **classifies** the failure in this order: unknown id (404), status not a legal source (`INVALID_TRANSITION`), revision not latest (`STALE_REVISION`). The re-read decides only which error to report, never whether to write, so it adds no race. Body validation (400) runs before all of it. Status is the more fundamental truth, so it is reported first. `PUT` and `resend` follow the same pattern: the conditional status write comes **first** inside the transaction (`PUT`: `status in (draft, changes_requested)`; `resend`: `status = changes_requested`), then the items are touched; `resend` reads the items for the snapshot after its write. A `PUT` that loses to a resend therefore updates 0 rows and returns `NOT_EDITABLE`.

**Chat post order:** body validation, then `clientId` replay lookup (a match returns the existing entry, or `IDEMPOTENCY_CONFLICT` on a different payload), then in one transaction the `canPostChat` check and the insert. SQLite serializes writers, so a chat can never be committed after a terminal entry. A unique violation on `(proposalId, clientId)` from a concurrent duplicate is treated as a replay.

## 6. Behavior by surface

Visual language follows [design.md](../../design.md): quiet and premium for the member, fast and dense for the concierge.

**Member (`/proposal/[id]`)**

| Status               | What the member sees                                                                                                                                                                                      | Actions                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `sent`, revision 1   | Itinerary as today                                                                                                                                                                                        | **Approve**, **Request changes**, Decline (menu), Message |
| `sent`, revision ≥ 2 | Cover message and signature above the itinerary, a collapsible "What changed", a "Revision N" pill                                                                                                        | Same                                                      |
| `changes_requested`  | Last revision, read-only, "Changes requested" pill, "{Signature} is working on your request". The signature is the latest concierge entry's; until one exists the name is "Your concierge" (never blank). | Message, Decline                                          |
| `approved`           | Trip pass as today                                                                                                                                                                                        | **Pay & Lock In**, Message                                |
| `paid` / `declined`  | Confirmation as today / a quiet closing page. Conversation read-only.                                                                                                                                     | none                                                      |

- Request changes and Decline share one sheet with a mandatory message. Decline asks for explicit confirmation.
- **Displayed vs. latest.** The client keeps `displayedRevision` apart from the latest revision it knows, and keeps the displayed snapshot it already loaded. When a newer revision is learned (refetch on focus, a `STALE_REVISION` response, or polling), the banner appears, the displayed revision stays on screen, and **actions stay disabled until the member opens the new one**. Every action sends `displayedRevision`. The server guard is the backstop, not the plan.
- **Typed text is kept, never auto-sent.** After the member opens the new revision, a half-written request or decline stays in the sheet, marked "written for revision 1", and needs a fresh tap to send.

**Concierge (`/planning/[id]`)**

- The list keeps its current order (newest first). `changes_requested` rows carry a "needs you" accent, plus `Rev N` and last activity. It refetches on focus and, with polling (P2), every few seconds, so the signal isn't missed.
- In `changes_requested` the builder is editable with the member's **pending request** pinned above it: the latest request plus everything the member wrote after it. The primary action is **Reply & resend** (cover message, signature, change summary).
- **Preview** renders the working copy in `draft` and `changes_requested` (what the member will see after sending) and the latest revision otherwise.
- A Conversation tab sits beside the builder; a revisions list opens any version read-only (P2).
- After a decline the builder is read-only and shows the latest revision with the reason. The way forward is a new proposal for the same reservation.

Optimism, polling and sheet details: [appendix F](appendix.md#f-surface-behavior-details).

## 7. Edge cases, decisions, open questions

**Edge cases** (selected; the full list of 18 is in [appendix D](appendix.md#d-edge-cases))

| #    | Situation                                               | Expected                                                                                                                |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| E-1  | Approve and request-changes race                        | One wins by conditional write; the loser gets `INVALID_TRANSITION` and refetches. No orphan entry.                      |
| E-2  | Member acts on revision 1 after revision 2 was sent     | `STALE_REVISION`, nothing written, banner shown, typed text kept but not auto-sent.                                     |
| E-3  | Two concierge tabs resend at once                       | One creates revision N+1; the other gets `INVALID_TRANSITION`. Unique number is the backstop.                           |
| E-4  | Member declines while the concierge edits               | The next save returns `NOT_EDITABLE`; the builder shows the latest revision and the reason. Unsent edits not shown.     |
| E-6  | Resend with zero items                                  | `EMPTY_PROPOSAL` (422); full rollback, no revision, email or entry.                                                     |
| E-8  | Response lost after a successful chat post, then retry  | Same `clientId`: the server returns the existing entry, even if the conversation has closed since.                      |
| E-15 | Response lost after a successful transition, then retry | `INVALID_TRANSITION`. The UI refetches and succeeds only if the conversation holds this member's matching entry.        |
| E-16 | 500 chat entries exist                                  | Chat gets `CONVERSATION_FULL`, but approve, pay, decline, request-changes and resend all still succeed.                 |
| E-17 | A `PUT` races a resend in another tab                   | The resend wins or the `PUT` does, never both interleaved. The loser gets `NOT_EDITABLE`; working copy equals revision. |

**Key decisions** (all sixteen with rejected alternatives: [appendix E](appendix.md#e-decisions-and-alternatives))

| ID   | Decision                                                        | Rejected                                                                  |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| D-1  | Two member actions: request changes (loops), decline (terminal) | One "decline" that always loops                                           |
| D-2  | Immutable **revisions** under one proposal and one link         | New proposal per change; editing `sent` in place                          |
| D-4  | **Polling**, not WebSocket/SSE                                  | Push: no long-lived-connection infrastructure, no auth to scope a channel |
| D-7  | `currentRevision` on `Proposal` for an atomic guard             | Read the latest revision, then write                                      |
| D-8  | Member reads the **latest revision**                            | Member reads the working copy                                             |
| D-10 | Unchanged resend allowed                                        | Reject with `NO_CHANGES`                                                  |
| D-16 | One consistent member view response                             | Compose detail and revision from two requests                             |

**Open questions** (each has a default so implementation isn't blocked)

| ID   | Question                                                                   | Proposed default                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OQ-1 | Request changes or decline from `approved`?                                | No. Approval is a commitment; retraction is a separate feature.                                                                                                                                                 |
| OQ-2 | Conversation open after `paid`?                                            | Read-only. Post-payment changes are another workflow.                                                                                                                                                           |
| OQ-3 | Should a concierge chat reply also log a simulated email?                  | No, only resends do. A member must revisit the link to see replies; name this gap in the README.                                                                                                                |
| OQ-4 | Can the concierge end a stalled negotiation or recall a mistaken revision? | No, out of scope; belongs with cancel/expire. Known limitation: a `sent` revision with a wrong price can't be withdrawn. The remedy is a chat message, or the member requests changes, so the loop corrects it. |
