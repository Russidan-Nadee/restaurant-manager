# Neon Setup Implementation Plan

**Goal:** Connect the existing restaurant app to the supplied Neon project and production branch, then prove the connection through a production build and live application requests.

**Architecture:** Next.js Node.js handlers own database access. Use pooled `DATABASE_URL` for app traffic, direct `DATABASE_URL_UNPOOLED` for transactional SQL migrations, and preserve database-side order pricing/atomicity. Provision Postgres only.

**Scope authorization:** The user's six-step Neon setup request. Work in the requested project root, preserving the earlier local rename. The user selected real integration verification without adding unit tests.

- [x] Install CLI, initialize the supplied project/branch and deploy neon.ts.
- [x] Read installed Neon and local Next.js guides; choose pg and Vercel pool lifecycle support.
- [x] Confirm production has no existing public tables; create an expiring validation branch.
- [x] Migrate the schema on validation branch, then production.
- [x] Replace Supabase client calls with server-only database access and an order API.
- [x] Run lint, typecheck, production build and real HTTP/database checks; remove verification fixtures.
- [x] Report exact output and any setup/dependency failures.

## Verification cases

HTTP health must reach Postgres. Homepage must render DB-backed restaurant counts. A submitted order must use current DB prices and persist its item snapshots. Empty carts, invalid quantities, unavailable menus, unknown tables and malformed JSON must be rejected. A failure after an earlier valid line must roll back the whole order. Changing menu prices must leave historical snapshots intact. The verification script removes its own fixtures afterward.

Results: see ../../neon-setup-verification.md.
