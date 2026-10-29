# Configurable Statuses Implementation Plan

**Goal:** Configurable ordered table/food states with actual visit lifecycle.
**Architecture:** pg transactions share an advisory lock; ordered configuration
drives per-food progression and a separate table-session cycle.
**Tech Stack:** Next.js 16, React 19, TypeScript, pg, Neon, Lucide.
**Spec:** docs/superpowers/specs/2026-10-29-workflow-statuses-design.md

## Constraints and ownership

No preparing state, fake records, payment, tests/build or automatic commit/push.
Preserve concurrent homepage and docs changes. Work in the user's current checkout
so the existing local dev server sees the result. Use typed interfaces to separate
UI, configuration writes and runtime operations; do not replace another's files.

## Tasks

- [x] Add migration 005, shared types and visit-aware read queries.
- [x] Implement protected configurable status CRUD and ordered progression.
- [x] Add admin configuration UI and kitchen/cashier state controls.
- [x] Integrate real status labels into overview and prevent occupied retirement.
- [x] Review races/stale forms and migration compatibility; fix findings.
- [x] Run lint/types and apply only migration005; verify metadata read-only.
- [x] Document usage, limitations and future user-reviewed unit-test cases.

## Rulings

- Use a table-session record to group repeat orders without adding billing.
- Final active food step means complete; seeded served is optional but last.
- Configuration ordering changes require no unfinished food to avoid live tickets
  unexpectedly regaining work. Deleting a referenced active status is forbidden.
- Use the existing checkout, no worktree/branch ceremony; the user asked us to
  design and proceed in their app and concurrent edits are in different modules.
- Unit-test cases will be proposed for owner review later; do not add test code.

## Verification and review

- ESLint and TypeScript both exited 0 after final source fixes.
- git diff --check reported no whitespace errors.
- Independent source review approved migration, configuration, runtime and UI.
  Fixed status INSERT RETURNING id and stale free-table replay via state tokens.
- Applied only 005_workflow_statuses.sql on temporary Neon branch
  workflow-statuses-20261029 (expires 2026-10-29T05:53:15Z), then production.
- Read-only checks confirmed migration checksum, five default states, session
  table, original option function, new wrapper and state-token column.
- No unit tests, build, browser checks or automated order/transition tests run.
  Future cases to review with owner: protected/used status deletion, stable
  insertion order, required transitions, stale/repeated forms across visits,
  pending-food closure guard and repeat orders joining the same visit.