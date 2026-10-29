# Menu Options Implementation Plan

**Goal:** Add per-menu protein/special configuration, a mobile ordering dialog,
and editable per-variant cart quantities through to kitchen order snapshots.

**Architecture:** Extend the existing native-dialog and Next.js server patterns.
Keep the atomic Postgres order function authoritative for availability and prices.

**Tech stack:** Next.js App Router, React, TypeScript, pg, Neon Postgres, Lucide.

**Spec:** docs/superpowers/specs/2026-10-28-menu-options-design.md

## Constraints

- Preserve existing and concurrent table-management work.
- No new dependency, fake data, automatic commit or push.
- User declined adding/running tests. Use lint, types and source review only.

## Tasks

- [x] Define five canonical protein IDs/Thai labels and fixed special price 10.
- [x] Implement admin per-menu checkbox configuration with server validation.
- [x] Implement authoritative option validation and historical order snapshots
  in 004_menu_options.sql, order-repository.ts and orders.ts.
- [x] Implement native mobile bottom sheet and variant-aware cart in
  MenuItemDialog.tsx, MenuOrder.tsx and page.module.css.
- [x] Extend customer query/types, kitchen and admin recent-order presentation.
- [x] Merge source updates without replacing concurrent edits.
- [x] Run ESLint and TypeScript; address source-review findings.
- [x] Inspect already-applied migration004: recorded checksum, five columns and
  installed function body match the repository. No migration was run this turn.
- [x] Explain admin configuration required before options appear to customers.

## Continuation — 2026-10-29

- Added saved food-option summaries to the admin menu table and mobile cards.
- Read-only Neon inspection confirmed all 12 menus currently have protein and
  special settings disabled. No menu records or orders were created or changed.
- After the summary UI change, npm run lint and npm run typecheck both exited 0; git diff --check reported no whitespace errors.
- Browser ordering and runtime order placement remain unverified; no automated
  tests or build were requested. Review unit-test cases with the owner first.
