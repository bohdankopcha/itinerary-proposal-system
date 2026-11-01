# Design

Two intentionally different views in one app. Tokens live in `src/app/globals.css` (source of truth); this file records intent and names. Build rules: `frontend` skill. Mobile-first (375px), light theme only.

> **Status:** the concierge view follows the Claude Design output (see "Design output" at the bottom, which wins where it differs). The member view below is still provisional until its design is implemented.

## Shared

- Stack: Tailwind with theme tokens only (no arbitrary values), shadcn/ui primitives where one exists.
- Every screen has loading, empty, and error states.
- Status badge is one component used in both views. Four semantic status tokens: `draft`, `sent`, `approved`, `paid`, each a clearly different hue, never relying on color alone (label always shown).
- Money formatted once through a shared formatter (USD, cents in, no decimals shown for whole dollars). Dates and times via one formatter pinned to UTC, see [data-model.md](data-model.md).
- Category identity (label + icon) comes from one category map shared by both views.
- The itinerary presentation (header, note, cards / timeline) is **one set of components** used by the member page and by the concierge preview, so preview is always faithful.
- **Motion:** CSS transitions/keyframes via Tailwind only; no animation library without asking. Every animation is disabled under `prefers-reduced-motion`. Motion is slow and subtle in the member view, nearly absent in the concierge view.
- **Optimistic UI:** status badges and action buttons switch immediately on click; on rollback the UI shows the error inline, not a blocking dialog. Rules: [proposal-lifecycle.md](proposal-lifecycle.md).

## Concierge view (`/`)

**Tone:** efficient, calm, utilitarian. Clarity over decoration. Neutral surfaces, one restrained accent, dense but readable.

- **Fonts:** a single sans family for everything.
- **Reservation switcher:** at the very top; lists each reservation as member name, destination, dates. Selection is stored in the URL (`?reservation=<id>`); default is the earliest arrival. Switching swaps the trip header, builder, and list; unsaved builder content is discarded after a confirm.
- **Trip header:** destination, villa, member name, arrival, departure, nights. Always visible and prominent.
- **Layout (desktop):** two tabs. Itinerary: trip header, then week planner (left) and proposal panel (right). Proposals: list of all proposals. On mobile the planner and panel stack.
- **Builder:** six category cards (color dot + name) as the entry point; selecting one opens a form (title, description, date/time constrained to the trip, price). Items appear as blocks in the week planner with edit/remove; the panel has a running total, a note field, and **Preview**, **Save draft**, **Send** actions. Send is disabled with no items.
- **Edit mode:** choosing a draft in the list loads it into the builder with a visible "Editing draft" state and a way to cancel. Non-draft rows open read-only preview instead.
- **Preview:** the shared proposal component in a dialog or sheet.
- **Send success:** dialog naming the recipient and showing the sent email; the proposal stays open, locked, with status `sent`.
- **Proposals list:** row per proposal across all clients: client, stay, dates, item count, total, status badge, last activity. Empty state invites the first proposal.
- **Interaction:** keyboard-friendly forms, immediate feedback; the only destructive action is removing an item from a draft.

## Member view (`/proposal/[id]`)

**Tone:** premium, quiet, warm, personal. Generous whitespace, slow subtle motion. Copy addresses the member by name, is concise, never salesy. No concierge UI chrome. Same Solar Flare palette and Geist type as the concierge view (the design uses one family; the earlier serif idea was dropped).

- **Structure (top to bottom):** status pill, destination title, villa and "prepared for" line, arrive / depart / nights; the concierge note in a collapsible glass block (open by default, only when a note exists); then the part driven by status.
- **`sent`:** a Cards / Timeline switch. Cards: day navigation (arrows, day chips, swipe) over a stack of tinted passes that expand on tap. Timeline: every day with its items, time ranges and subtotals. Bottom bar: estimated total and **Approve**.
- **`approved`:** the itinerary collapses into a gradient **trip pass** (dates, experience count, total); "View day-by-day" brings the cards back. Bottom bar: **Pay & Lock In**.
- **`paid`:** the trip pass gets a "Locked" stamp, then the **confirmation screen**: a postcard whose headline words, coastline and pin animate in, a confirmation number, and a trip summary with the total paid. A paid proposal opened from the email lands directly on it; "Back to itinerary" returns to the day-by-day.
- **Buttons come from the transition table** (`nextStatus`), never per-status code. Approve and Pay switch status immediately; the lock animation waits for the server before showing the confirmation, and errors show inline in the bar.
- **Not available:** `draft` or unknown id shows a quiet "not available yet" message that reveals nothing about the proposal.
- **Mobile:** the primary target. Single column up to 36rem, sticky bottom bar with total and the one primary action.
- **Preview parity:** the concierge Preview renders the same header, note and itinerary components as a `sent` proposal (without the bar), so it matches what the member sees.
- **Generated, not stored:** the confirmation number is derived from destination initials, arrival date and the proposal id (see `formatConfirmationNumber`). The concierge is shown as "Your concierge" because the model has no concierge name. The postcard map is decorative art; the villa name is the only per-stay label (no coordinates exist).

## Token names (to define in `globals.css`)

Reuse the existing shadcn semantic tokens (`background`, `foreground`, `primary`, `muted`, `border`, `ring`, …). Add only:

- `--font-display` (member serif)
- `--status-draft|sent|approved|paid` (+ `-foreground`)
- `--member-*` accent/surface tokens if the member palette must differ from the concierge one (scope them under a `.member` wrapper class, so the concierge view keeps the base tokens)

## Design output

Source: Claude Design canvas "Concierge Itinerary Proposal" (boards `Concierge · Command` and `Client · Wallet`), both implemented.

**Concierge theme: Solar Flare only.** The design ships four themes; we use just this one, no theme switcher. The palette is mapped onto the shadcn semantic tokens in `globals.css` (cream `background`, deep red-brown `foreground`, red-orange `primary`, translucent glass `card`, near-opaque `popover` for dialogs and sheets), plus `field`, `panel-border`, `status-sent|approved`, and one `category-*` color per category. Ambient orbs, glass flutes and grain sit behind the concierge shell only; the drift animation is `motion-safe`.

**Concierge deviations from the provisional direction above** (the design wins):

- Top bar holds the Itinerary / Proposals tabs and the reservation switcher. The proposals list is its own tab (`?view=proposals`) and shows **all clients**, with the current proposal highlighted, rather than a column beside the builder.
- The builder is a week planner (7 days per page, 7 AM to midnight), not a list of items. Category cards open in a dialog, the item form in a right sheet. Event heights come from a fixed per-category duration (items have no end time). Clicking a block edits it; double-clicking a day or "Add item" starts a new one.
- Beside the planner sits one proposal panel: note, running total, per-category breakdown, **Preview**, **Save draft**, **Send**.
- Send success is a dialog showing the server's email record; afterwards the proposal stays open, locked and read only (the builder does not reset). Starting another proposal goes through the Proposals tab.
- No toasts: save results and errors show inline in the proposal panel.
- Opening a draft from the list sets `?proposal=<id>` and shows "Editing draft"; a non-draft opens locked in the same planner.
- With no `proposal` param the planner opens the reservation's newest draft, so the seeded itinerary is visible straight away. `?proposal=new` is the explicit empty builder (used by "Cancel editing", the palette and the empty state of a reservation without drafts).
- Unsaved builder content is guarded by one confirm dialog on reservation switch, opening another proposal, or starting a new one.

**Concierge shortcuts:**

- **⌘K / Ctrl+K palette** (also the top-bar button): commands (add item, preview, send, switch view, new proposal, switch client) plus quick add. Typing "sunset cocktails fri 7pm 260" parses category, day, time and price into a live preview and creates the item on Enter. Missing parts default to the first open day, the category's usual start time and $0; a quick-added item gets a neutral description the concierge can edit.
- **Drag to reschedule:** blocks move between days and times in 15-minute steps with a dashed ghost; mouse only, the item sheet is the keyboard and touch route. Locked proposals do not drag.

**Not ported from the design:** the other three themes, and the night-hours / flight-time markers (no such data exists in the model). Item times are limited to the visible 7:00 to 23:30 range.
