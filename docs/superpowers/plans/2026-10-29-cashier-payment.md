# Cashier monitoring and manual payment

**Goal:** Kitchen controls food; cashier monitors, receives payment and frees tables.
**Architecture:** Existing visit model and lock serialize payment with ordering,
food progression and workflow edits. Monetary comparisons use integer cents.
**Owner decision:** Every food line must be at the final state before payment.

- [x] Remove food mutation controls from cashier; preserve kitchen controls.
- [x] Read current-visit DB total, display exact money and confirm receipt in dialog.
- [x] Add unique per-visit payment ledger and atomic checkout with stale guards.
- [x] Prevent unpaid table closure through ordinary status transitions.
- [x] Apply migration006 on temporary branch and production; inspect metadata.
- [x] Run lint/types and independent source review, preserving concurrent work.

No unit tests, build, browser test or business records will be generated. No commit
or push requested. Future user-reviewed unit cases: pending food blocks receipt,
DB sum wins over submitted amount, changed total rolls back, duplicate/stale visit
cannot charge again, payment closure frees table and food controls stay in kitchen.

## Verified outcome

- npm run lint and npm run typecheck both exited 0 after the final source changes.
- Independent source review approved payment atomicity, monetary precision,
  duplicate/stale guards and kitchen-only food controls.
- Applied only 006_table_payments.sql on workflow-statuses-20261029, then
  production. Read-only inspection matched the checksum and five columns and
  confirmed the unique per-session payment constraint.
- No payment transactions or sample records were created. No automated tests,
  build or browser ordering/checkout flow was run at the owner's request.