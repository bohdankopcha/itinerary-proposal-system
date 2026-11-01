# concierge-itinerary-proposals

Concierge itinerary proposals app: a single Next.js project (UI + API route handlers) backed by SQLite via Prisma.

## Stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · shadcn/ui · Prisma + SQLite · zod · TanStack Query · Vitest · ESLint + Prettier · Husky + lint-staged + commitlint. Package manager: npm.

## Commands

- `npm run dev` – prepare DB, then start Next.js dev server
- `npm run build` / `npm start` – production build / serve
- `npm run lint` / `lint:fix` – ESLint
- `npm run format` / `format:check` – Prettier
- `npm run typecheck` – `tsc --noEmit`
- `npm test` / `test:watch` – Vitest
- `npm run check` – lint + typecheck + test (used by CI)
- `npm run db:generate | db:migrate | db:deploy | db:seed | db:reset | db:studio`
- `npm run db:prepare` – generate + deploy + seed (idempotent)

## Structure

- `src/app/` – routing only: pages, layouts, route handlers. Thin; compose components and call `lib/`
- `src/components/` – UI only: one component per file (shadcn/ui in `ui/`)
- `src/hooks/` – React hooks holding component logic (state, queries, handlers)
- `src/lib/db/` – Prisma client singleton
- `src/lib/proposals/` – framework-agnostic business logic (no React, no Next.js)
- `src/lib/schemas/` – zod schemas and API contracts (`z.infer` types)
- `src/lib/api-client/` – typed fetch client used by hooks
- `prisma/` – schema, migrations, seed
- `docs/` – documentation
- `.claude/` – Claude Code settings and skills

Flow: `components` → `hooks` → `lib/api-client` → route handler in `app/` → `lib/proposals` → `lib/db`. Put new code in the folder that matches its role; don't create new top-level folders without asking.

## Conventions

- Write minimal comments; code should explain itself.
- One file = one component.
- Separate business logic from UI as much as possible: logic lives in `lib/` and hooks, components only render.
- Move component logic into hooks.
- Avoid unnecessary `useEffect`; derive values during render or use event handlers and TanStack Query.
- Keep types next to the code that uses them. No per-component `types` folders.
- API contracts live in `lib/schemas` as zod schemas, with types from `z.infer`.
- Avoid prop drilling; if needed, use React context. Ask the user for approval before introducing a context.
- Follow the file structure above.

<!-- BEGIN:nextjs-agent-rules -->

## Docs

Before starting a task, read the relevant file in `docs/`:

- [`docs/product.md`](docs/product.md) – scenario, roles, glossary, required capabilities, out of scope
- [`docs/data-model.md`](docs/data-model.md) – entities and modeling rules (fields live in `prisma/schema.prisma`)
- [`docs/proposal-lifecycle.md`](docs/proposal-lifecycle.md) – status state machine, transitions, errors, optimistic updates
- [`docs/api.md`](docs/api.md) – routes, error format and codes (contracts live in `src/lib/schemas/`)
- [`docs/design.md`](docs/design.md) – concierge and member view direction, tokens, motion
- [`docs/decisions.md`](docs/decisions.md) – what was chosen and why; assumptions

Rule: if you change behavior, update the matching file in `docs/` in the same change. Docs hold intent and rationale only; never copy what code already says (fields, payloads), link to it.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
