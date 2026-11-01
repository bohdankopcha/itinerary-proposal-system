---
name: git-workflow
description: Commit message, branch, and pull request conventions for this repo (Conventional Commits, PR title and description template). Use whenever committing, creating a branch, opening or editing a PR, or writing a PR description, even if the user just says "commit this" or "make a PR".
---

# Git workflow

Commit-msg hook enforces Conventional Commits (commitlint). AI attribution is disabled in `.claude/settings.json` (`attribution`), so do not add `Co-Authored-By` or "Generated with" lines.

## Commits

Format: `<type>(<optional scope>): <imperative summary>`, lowercase, no trailing period, header up to 72 chars.

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`.

Examples:

- `feat(proposals): add send action`
- `fix(api-client): handle empty error body`
- `chore: bump prisma`

One logical change per commit. Run `npm run check` before committing.

## Branches

`<type>/<short-kebab-description>`, e.g. `feat/proposal-approval`.

## Pull requests

- Title follows the same Conventional Commits format as the commit headers.
- Keep PRs small and focused on one change.
- Description template:

```md
## What

<what changed, 1-3 bullets>

## Why

<problem or goal>

## How to test

<steps; include mobile width check for UI changes>

## Notes

<migrations, new deps, follow-ups; omit if none>
```

TODO: merge strategy (squash vs. merge), PR size limits, linking issues, rule to never commit directly to `main`.
