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

## Concierge view (`/planning`, `/planning/[id]`)

**Tone:** efficient, calm, utilitarian. Clarity over decoration. Neutral surfaces, one restrained accent, dense but readable.

- **Fonts:** a single sans family for everything.
- **Reservation switcher:** at the very top; lists each reservation as member name, destination, dates. The open proposal determines the selected reservation; with none open, the selection is local state (default: earliest arrival). Choosing a client opens that client's newest proposal, or an empty builder if there is none. Switching swaps the trip header, builder, and list; unsaved builder content is discarded after a confirm.
- **Trip header:** destination, villa, member name, arrival, departure, nights. Always visible and prominent.
- **Layout (desktop):** two tabs. Itinerary: trip header, then week planner (left) and proposal panel (right). Proposals: list of all proposals. On mobile the planner and panel stack.
- **Planner stacking:** each day column is an isolated stacking context, so blocks, flight pills and the now-line (z-10/z-20 inside) never leave it. Sticky layers sit above: time gutter z-20, day headers z-30, corner z-40.
- **Builder:** six category cards (color dot + name) as the entry point; selecting one opens a form (title, description, date/time constrained to the trip, price). Items appear as blocks in the week planner with edit/remove; the panel has a running total, a note field, and **Preview**, **Save draft**, **Send** actions. Send is disabled with no items.
- **Edit mode:** choosing a draft in the list loads it into the builder with a visible "Editing draft" state.
- **Saved vs local:** edits live only on the screen until saved. The panel shows one cue: "Unsaved changes" (when dirty), "All changes saved" (clean), or "New draft: nothing saved yet". Actions stack in this order: **Save draft** (disabled unless dirty and non-empty), **Discard changes** (ghost, directly below Save, only when dirty; opens the discard confirm and reverts to the last saved version), **Preview**, **Send**. Save success has no toast or notice; the cue flipping to "All changes saved" is the feedback. Non-draft rows open read-only preview instead.
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
- **Header stats:** arrive, depart and nights sit in an equal-width 3-column grid (also at 375px), each a small uppercase label over a single-line value. Dates use one format, `Thu 12 Mar` (`formatDayMonth`, same parts as the planner day headers); nights read `7 nights`.
- **Generated, not stored:** the confirmation number is derived from destination initials, arrival date and the proposal id (see `formatConfirmationNumber`). The concierge is shown as "Your concierge" because the model has no concierge name. The postcard map is decorative art; the villa name is the only per-stay label (no coordinates exist).

## Performance rules

- No `filter: blur` or `backdrop-filter` on large or full-screen layers, and no `backdrop-blur` on repeated surfaces (`Panel` is a semi-opaque fill only). At most a small fixed surface (the action bar) may use a translucent fill; avoid blur there too.
- Ambient background: static, pale and airy, matching the Claude Design reference. A near-white warm base (`--background`) with a few very soft, wide radial tints (amber, peach, rose) at low alpha (about 0.1 to 0.22 light, 0.03 to 0.1 dark) pushed to the corners so the center stays white. Plain radial gradients from the `--ambient-*` tokens (redefined under `.dark`) plus a faint tiled data-URI grain (CSS), never a full-viewport SVG `feTurbulence`, blur, or infinitely animated large layers. Restraint comes from low alpha and white space, not from filters; do not raise alpha to make it "more vivid". Category and status accents are softened warm hues (tinted blocks at 10% fill), with one deeper warm `--primary` kept for primary actions.
- Repeated grids (planner hour lines) are one tiled `linear-gradient` background, not one element per row. Derived layout (day grouping, overlap slots) is memoized; per-pointermove state must stay cheap (resize updates one range).
- Animate `transform` and `opacity` only; for expand/collapse use `grid-template-rows` 0fr to 1fr (about 300ms), never `height`/`top`/`width` and never mount heavy trees on open.
- Pass cards: collapsed height is about 128px (`min-h-32`; taller when a long title wraps) with a 28px stack overlap hidden by bottom padding, so the stack reads as layered cards. Colors are muted warm tints (`--pass-*`, redefined darker under `.dark`) with white `--pass-foreground` text, all at least 5:1 contrast (AA); no saturated fills on the pale background. One `PassCard` component renders them in the member page and in the concierge Preview (`ProposalPresentation` → `ItineraryExplorer` → `DayCards`). The always-visible summary (category, time, title, price) never changes on toggle; only the description is revealed below it (grid rows 0fr to 1fr plus opacity), so text never re-flows or swaps. All cards, including the last, share the same collapsed height and behavior.
- A whole card is the click target (card root is the toggle, with `role`, `aria-expanded` and Enter/Space); no scroll listeners that set state.

## Scrollbars and cursors

- **Scrollbars:** every scroll container (including horizontal and the schedule planner) gets a thin 6px rounded thumb on a transparent track from a global base rule in `globals.css`, colored by `--scrollbar-thumb` / `--scrollbar-thumb-hover` (light and dark). No per-component scrollbar classes.
- **Cursors:** interactive elements show `cursor-pointer` via the `Button` base classes, the `Select` trigger and items, and a base-layer rule for enabled buttons and `role=button|tab|option|menuitem`. Disabled controls keep `pointer-events-none` (or `cursor-not-allowed`). Don't add cursor classes per screen.

## Token names (to define in `globals.css`)

Reuse the existing shadcn semantic tokens (`background`, `foreground`, `primary`, `muted`, `border`, `ring`, …). Add only:

- `--font-display` (member serif)
- `--status-draft|sent|approved|paid` (+ `-foreground`)
- `--member-*` accent/surface tokens if the member palette must differ from the concierge one (scope them under a `.member` wrapper class, so the concierge view keeps the base tokens)

## Design output

Source: Claude Design canvas "Concierge Itinerary Proposal" (boards `Concierge · Command` and `Client · Wallet`), both implemented.

**Concierge theme: Solar Flare only.** The design ships four themes; we use just this one, no theme switcher. The palette is mapped onto the shadcn semantic tokens in `globals.css` (cream `background`, deep red-brown `foreground`, red-orange `primary`, translucent glass `card`, near-opaque `popover` for dialogs and sheets), plus `field`, `panel-border`, `status-sent|approved`, and one `category-*` color per category. Ambient orbs, glass flutes and grain are static layers behind both shells (plain radial gradients and a tiny tiled grain image, no animation).

**Concierge deviations from the provisional direction above** (the design wins):

- Top bar holds the Itinerary / Proposals tabs and the reservation switcher. The proposals list is its own tab (local state, not in the URL) and shows **all clients**, with the current proposal highlighted, rather than a column beside the builder.
- The builder is a week planner (7 days per page, 7 AM to midnight), not a list of items. The item form (category pills, title, description, date, start and end time, price) is a right sheet. Event height comes from the item's duration, defaulting to a per-category duration until it is set. Clicking a block edits it; double-clicking a day or "Add item" opens the item sheet directly in create mode (no category dialog; category is a pill group in the sheet).
- Beside the planner sits one proposal panel: note, running total, per-category breakdown, **Preview**, **Save draft**, **Send**.
- Send success is a dialog showing the server's email record; afterwards the proposal stays open, locked and read only (the builder does not reset). Starting another proposal goes through the Proposals tab.
- No toasts: save results and errors show inline in the proposal panel.
- Opening a proposal from the list navigates to `/planning/<id>` and shows "Editing draft"; a non-draft opens locked in the same planner. `/` redirects to `/planning`, the planner with no proposal open (empty builder, used by "New proposal" and the empty state).
- The only URL state is the proposal id in the path. Tab, client selection without a proposal, and builder state are local; the dashboard lives in the `/planning` layout so they survive navigation between proposals. Navigation runs in a transition with an optimistic id, so the UI reacts instantly while the route updates.
- The concierge never sees proposal ids or references: headers and rows show client, destination, dates and status. The send-success dialog shows and copies the client link (`/proposal/<id>`).
- Unsaved builder content is guarded by one confirm dialog on reservation switch, opening another proposal, or starting a new one.

**Concierge shortcuts:**

- **⌘K / Ctrl+K palette** (also the top-bar button): commands (add item, preview, send, switch view, new proposal, switch client) plus quick add. Typing "sunset cocktails fri 7pm 260" parses category, day, time and price into a live preview (an end time or length is understood too: "7pm-9pm", "from 7 to 9pm", "7pm till 9pm", "for 2h", "for 90 min") and creates the item on Enter. Missing parts default to the first open day, the category's usual start time and $0; a quick-added item gets a neutral description the concierge can edit.
- **Overlaps:** items overlapping in time within a day split that day column side by side (equal widths per overlap cluster, packed by `layoutOverlaps` in `src/lib/proposals/`); layout updates live while resizing.
- **Resize:** drag a block's top or bottom edge (pointer events) to change start or end; 15-minute snap, 30-minute minimum, clamped to the visible day. Applies to the local draft like any edit (persisted by Save draft); locked proposals show no handles. The sheet's end time edits the same duration.
- **Block hover:** lift, shadow elevation and ring emphasis; no lift under reduced motion.
- **Flights:** the client's landing time (first day) and departure time (last day) are drawn as a labeled line across the day column at that time.
- **Drag to reschedule:** blocks move between days and times in 15-minute steps with a dashed ghost; mouse only, the item sheet is the keyboard and touch route. Locked proposals do not drag.

**Not ported from the design:** the other three themes, and the night-hours (sunrise/sunset) markers (no such data exists in the model). Item times are limited to the visible 7:00 to 23:30 range.
