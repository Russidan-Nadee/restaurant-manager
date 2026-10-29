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
- [ ] Implement authoritative option validation and historical order snapshots
  in 004_menu_options.sql, order-repository.ts and orders.ts.
- [ ] Implement native mobile bottom sheet and variant-aware cart in
  MenuItemDialog.tsx, MenuOrder.tsx and page.module.css.
- [x] Extend customer query/types, kitchen and admin recent-order presentation.
- [ ] Merge source updates without replacing concurrent edits.
- [ ] Run ESLint and TypeScript; address source-review findings.
- [ ] Apply only migration004 and read back its recorded checksum/columns.
- [ ] Explain admin configuration required before options appear to customers.
