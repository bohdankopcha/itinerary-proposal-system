# Design

Two intentionally different views in one app. Tokens live in `src/app/globals.css` (source of truth); this file records intent and names. Build rules: `frontend` skill. Mobile-first (375px), light theme only.

> **Status:** direction below is provisional. When the Claude Design output lands, paste its decisions into the "Design output" section at the bottom and make the direction above it match. Do not leave contradictions.

## Shared

- Stack: Tailwind with theme tokens only (no arbitrary values), shadcn/ui primitives where one exists.
- Every screen has loading, empty, and error states.
- Status badge is one component used in both views. Four semantic status tokens: `draft`, `sent`, `approved`, `paid`, each a clearly different hue, never relying on color alone (label always shown).
- Money formatted once through a shared formatter (USD, cents in, no decimals shown for whole dollars). Dates and times via one formatter pinned to UTC, see [data-model.md](data-model.md).
- Category identity (label + icon) comes from one category map shared by both views.
- The proposal presentation (hero, note, day timeline, total) is **one component** used by the member page and by the concierge preview, so preview is always faithful.
- **Motion:** CSS transitions/keyframes via Tailwind only; no animation library without asking. Every animation is disabled under `prefers-reduced-motion`. Motion is slow and subtle in the member view, nearly absent in the concierge view.
- **Optimistic UI:** status badges and action buttons switch immediately on click; on rollback the UI shows the error inline, not a blocking dialog. Rules: [proposal-lifecycle.md](proposal-lifecycle.md).

## Concierge view (`/`)

**Tone:** efficient, calm, utilitarian. Clarity over decoration. Neutral surfaces, one restrained accent, dense but readable.

- **Fonts:** a single sans family for everything.
- **Reservation switcher:** at the very top; lists each reservation as member name, destination, dates. Selection is stored in the URL (`?reservation=<id>`); default is the earliest arrival. Switching swaps the trip header, builder, and list; unsaved builder content is discarded after a confirm.
- **Trip header:** destination, villa, member name, arrival, departure, nights. Always visible and prominent.
- **Layout (desktop):** below the header, two columns: left = builder, right = proposals list. On mobile they stack: builder first, then list.
- **Builder:** six category cards (icon + name) as the entry point; selecting one opens a compact form (title, description, date/time constrained to the trip, price). Added items appear in a list ordered by time with edit/remove, a running total, a note field, and **Preview**, **Save draft**, **Send** actions. Send is disabled with no items.
- **Edit mode:** choosing a draft in the list loads it into the builder with a visible "Editing draft" state and a way to cancel. Non-draft rows open read-only preview instead.
- **Preview:** the shared proposal component in a dialog or sheet.
- **Send success:** inline confirmation naming the recipient and the resulting `sent` status; builder resets.
- **Proposals list:** row per proposal of the selected reservation: created date, item count, total, status badge. Empty state invites the first proposal.
- **Interaction:** keyboard-friendly forms, immediate feedback; the only destructive action is removing an item from a draft.

## Member view (`/proposal/[id]`)

**Tone:** premium, quiet, warm, personal. Generous whitespace, restrained palette, slow subtle motion. Copy addresses the member by name, is concise, never salesy. No concierge UI chrome.

- **Fonts:** an elegant serif for display (hero, day headings, totals) paired with a clean sans for body and labels. Load via `next/font`; expose as `--font-display` and `--font-sans`.
- **Palette direction:** warm ivory/off-white background, deep ink or dark green-black text, a single muted metallic (gold/bronze) accent used sparingly for rules, timeline line, totals, and the primary action. Soft gradients and subtle imagery in the hero only.
- **Structure (top to bottom):**
  1. Hero: destination, villa, dates, personal greeting.
  2. Concierge note, if present, set apart in a quiet "from your concierge" block.
  3. **Day-by-day timeline:** a vertical line with one section per day that has items, headed "Day N" plus the date (N counted from arrival). Items inside a day ordered by time; each shows time, category label, title, description, price. Optional per-day subtotal.
  4. Total, clearly separated and prominent.
  5. Action area driven by status: `sent` → **Approve**; `approved` → **Pay & Lock In**; `paid` → confirmation.
- **Animation:** timeline days fade/slide in on first view; Approve and Pay buttons have a pending state; the **confirmation screen animates in** (e.g. checkmark draw, staggered reveal of trip summary and total). Optimistic status change must not cause layout jump.
- **Confirmation screen:** "your itinerary is confirmed", trip summary, total paid, and the day timeline remains accessible below.
- **Not available:** `draft` or unknown id shows a graceful, on-brand message, never an error dump.
- **Mobile:** the primary target (members open the email on a phone). Sticky bottom action bar with total and the one primary button.

## Token names (to define in `globals.css`)

Reuse the existing shadcn semantic tokens (`background`, `foreground`, `primary`, `muted`, `border`, `ring`, …). Add only:

- `--font-display` (member serif)
- `--status-draft|sent|approved|paid` (+ `-foreground`)
- `--member-*` accent/surface tokens if the member palette must differ from the concierge one (scope them under a `.member` wrapper class, so the concierge view keeps the base tokens)

## Design output

_Pending: paste the Claude Design result here (palette values, font choices, spacing/radius scale, key screen notes)._
