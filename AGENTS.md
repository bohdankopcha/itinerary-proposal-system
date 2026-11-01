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

- `src/app/` – Next.js App Router (pages, layouts, route handlers)
- `src/components/` – React components (shadcn/ui in `ui/`)
- `src/hooks/` – React hooks
- `src/lib/db/` – Prisma client singleton
- `src/lib/proposals/` – framework-agnostic domain logic
- `src/lib/schemas/` – zod schemas
- `src/lib/api-client/` – typed fetch client
- `prisma/` – schema, migrations, seed
- `docs/` – documentation
- `.claude/` – Claude Code settings and skills

## Conventions

To be filled in

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
