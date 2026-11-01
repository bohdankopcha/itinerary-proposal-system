---
name: db-change
description: Required procedure and hard rules for any database change - editing prisma/schema.prisma, creating migrations, updating the seed, zod schemas, and the data model doc. Use whenever touching the Prisma schema, adding models or fields, writing migrations, changing seed data, or resetting the local DB.
---

# Database change

## Order of work

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <short_description>` (or `npm run db:migrate`). Commit the generated migration.
3. Update `prisma/seed.ts`.
4. Update the affected zod schemas in `src/lib/schemas/`.
5. Update `docs/data-model.md` if entities or modeling rules changed (rationale only, never copy fields).
6. Add or update tests, then run `npm run check`.

## Hard rules

- Never edit a migration that has already been applied or committed; create a new one instead.
- Never use `prisma db push` for changes that go into the repo.
- Reset the local DB with `npm run db:reset` (`prisma migrate reset`).
- The seed must be idempotent: use upserts so it is safe to run repeatedly.
- Prisma 7: the client is generated to `src/generated/prisma` (git-ignored) and uses the better-sqlite3 adapter; the datasource URL lives in `prisma.config.ts`.
