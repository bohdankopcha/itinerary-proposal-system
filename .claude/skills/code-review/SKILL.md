---
name: code-review
description: Review the current diff or branch against this repo's rules. Runs lint, typecheck, tests, and build, then checks the diff against AGENTS.md conventions, API route validation, state machine tests, stray console.log, mobile viewport, and unneeded dependencies. Use when the user asks to review, check, or verify changes, or before opening a PR.
---

# Code review

## 1. Automated checks

Run and report failures with output:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 2. Diff review (`git diff main...HEAD`)

Check against the Conventions and Structure sections in `AGENTS.md`.

## 3. Specific checks

- **Route handlers:** every handler validates input (params, query, body) with a zod schema and returns the single shared error format and codes from `docs/api.md`.
- **State machine:** every state transition has a test, including invalid transitions; transitions match `docs/proposal-lifecycle.md` and live in one place in `src/lib/proposals/`.
- **Docs in sync:** if the diff changes behavior (routes, error codes, transitions, data model rules, UI flow or design direction), the matching file in `docs/` is updated in the same diff; flag any divergence between code and docs, and any doc text that duplicates code (fields, payloads) instead of linking to it.
- **Leftovers:** no `console.log`, debugger statements, commented-out code, or stray TODOs without context.
- **Mobile:** UI changes were checked at 375px width (see `frontend` skill).
- **Dependencies:** each new package in `package.json` is actually used and justified; flag duplicates of existing ones.
- **DB:** schema changes follow the `db-change` skill (migration present, seed and zod schemas updated).

## Output

Findings grouped by severity (blocking / should fix / nit), each with `file:line` and a suggested fix. State clearly if checks passed.
