---
name: manual-testing
description: How to run the app and manually test it in a browser, including the full proposal flow (create, send, approve, pay), mobile-width checks, and resetting and reseeding the database. Use when asked to try, verify, demo, or click through a change in the running app.
---

# Manual testing

## Start the app

```bash
npm install && npm run dev   # http://localhost:3000, DB is prepared automatically
```

## Reset and reseed the DB

```bash
npm run db:reset   # drops the local DB, reapplies migrations, runs the seed
```

## Full flow: create → send → approve → pay

Use a browser tool (e.g. the `browser-use` or `yab-browser` skill). Take a screenshot at each step.

1. Concierge creates a proposal. TODO: route, required fields.
2. Concierge sends it. TODO: expected status and resulting link.
3. Member opens the link and approves. TODO: route, expected status.
4. Member pays. TODO: payment mechanism (mock vs. real), expected final status.

At each step verify: status shown in the UI, loading/empty/error states, no console errors, network calls return expected status codes.

## Mobile

Repeat the flow at 375px width. Check: no horizontal scroll, tap targets are comfortably large, text is readable, primary actions are reachable.

## Report

List the steps run, what passed, what failed (with screenshots), and anything not tested.
