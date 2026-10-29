# Table management implementation plan

Goal: Add/remove tables and set optional admin-only names while preserving customer numbers and QR URLs.
Approved behavior: retirement retains history and is blocked by placed/preparing/ready orders.
Architecture: existing Next.js admin dialogs and Server Actions, PostgreSQL migration 003,
immutable restaurant_tables.name codes and nullable display_name plus is_active.
Constraints: no mock business data, no emoji, no customer names, no tests/build under the owner's instruction.

- [x] Create migration 003 with optional display names, active state and non-reused three-digit sequence.
- [x] Apply migration to the configured Neon database without inserting fixture tables.
- [x] Implement validated create/rename/retire writes and admin-only name queries in src/lib/table-management.ts.
- [x] Serialize retirement/order placement on the same table row and reject retired table orders.
- [x] Add TableEditor and table Server Actions; preserve TableQRCode targets and numeric customer data.
- [x] Filter retired tables from customer selection, cashier and dashboard table count.
- [x] Review source/diff and update docs without tests/build.
- [ ] When authorized, review unit cases with the owner: rename preserves QR, customer numbers stay numeric,
  unused tables retire, pending orders block retirement, stale orders fail and retired codes are not reused.
