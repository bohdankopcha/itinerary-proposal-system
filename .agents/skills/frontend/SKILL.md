---
name: frontend
description: Pattern for building UI in this repo - adding a new screen (component, hook, TanStack Query over api-client, loading/empty/error states), mobile-first checks, theme tokens for colors and fonts, and the member vs. concierge view styling. Use whenever creating or changing screens, components, or styles.
---

# Frontend

## Adding a screen

1. Page in `src/app/` – thin, composes components only.
2. Component in `src/components/` – one per file, renders only.
3. Hook in `src/hooks/` – holds state and handlers; data via TanStack Query on top of `src/lib/api-client/` (never raw `fetch`).
4. Always implement three states: **loading**, **empty**, **error**. No screen is done without them.

## Mobile first

Design for 375px width first, then scale up. Before finishing, check at 375px: no horizontal scroll, readable text, reachable actions.

## Styling

- Colors, fonts, radii, spacing: only theme tokens (CSS variables in `src/app/globals.css`, Tailwind classes backed by them). No arbitrary values like `text-[#123456]` or `w-[317px]`.
- Use shadcn/ui components where one exists; add new ones with the shadcn CLI.

## Member view vs. concierge view

The two views are intentionally styled differently. Direction, layout, tokens and motion rules are in `docs/design.md`; read it before building or restyling a screen, and update it if the direction changes.
