# Restaurant Manager

Restaurant application built with Next.js App Router, TypeScript and Neon PostgreSQL.
The current foundation includes a database-backed summary page, order API, health
check and versioned SQL migrations. Menu/cart, kitchen and admin interfaces are
future work.

## Setup

1. Install dependencies: `npm install`.
2. Sign in: `neon login`.
3. Link this checkout:
   `neon init -y --org-id org-small-mouse-78424052 --project-id quiet-bonus-16300508 --branch production --services postgres --no-agent-setup`.
4. Run `neon deploy`. This applies `neon.ts` and updates the gitignored `.env`
   (or `.env.local` if no `.env` exists).
5. Run `npm run db:migrate` to create the restaurant tables and atomic ordering function.
6. Run `npm run dev` and open http://localhost:3000.

## Environment

- `DATABASE_URL`: pooled application connection, used only on the server.
- `DATABASE_URL_UNPOOLED`: direct connection for migrations and verification.
- `NEON_BRANCH`: branch identity from the CLI.

No database credentials are sent to the browser. The `pg` pool is shared across
requests and registered with `attachDatabasePool` for Vercel Fluid compute.
Only Postgres is declared; Auth, Object Storage and Realtime are not enabled.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm run start -- --port 3102
# In another terminal:
npm run verify:neon -- --base-url http://127.0.0.1:3102
```

The integration check calls the running app's health endpoint and order API,
checks the saved records directly in Neon, verifies rejection/rollback and price
snapshots, then deletes only its own UUID-scoped fixtures. It writes temporary
test data to the configured database; prefer a Neon development branch for
routine testing. It is an integration check, not a unit-test suite.

Migrations are transactional and recorded with SHA-256 checksums. Re-running
`db:migrate` skips an unchanged migration; add a new migration for later changes.
Schema changes should be checked on a temporary Neon branch before production.

## Windows build compatibility

The dev and build scripts use Webpack so Next.js can use its WASM fallback when Windows Application Control blocks native SWC bindings. No OS policy changes are required.
