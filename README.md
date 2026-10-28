# Your name Restaurant

Restaurant application built with Next.js App Router, TypeScript and Neon PostgreSQL.
The current foundation includes a minimal landing page, order API, health
check and versioned SQL migrations. Customer ordering, a read-only kitchen board and read-only admin menu/table views are included.

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

## Design

Follow [DESIGN.md](DESIGN.md), adapted from Scarpetta. No emoji are allowed in project-authored content. Use lucide-react for UI icons. The next proposed milestone is a customer ordering view and a kitchen view; the current landing page intentionally shows only the restaurant name.

## Application routes

- /order: select a real table.
- /order/001 through /order/005: initial table ordering pages. Other three-digit table numbers work when configured in the database.
- /kitchen: table, dish and quantity board with automatic refresh.
- /admin: Overview dashboard with real order/menu/table counts and the latest orders.
- /admin/menu: add/edit real menus, change prices, open/close sales and upload/remove menu images.
- /admin/tables: real table data with per-table QR preview, PNG download and ordering links.
- /admin/employees: employee page shell without mock employee records.
- Admin links also open customer, kitchen and cashier views. Authentication and staff authorization are not implemented yet.

No menu or order mock data is included. Migration 002 creates only the five table numbers requested by the owner. No tests or builds were run for this UI iteration at the owner's request.

## Cashier

/cashier shows real table tiles and refreshes automatically. Its current vacant/occupied state is inferred from placed/preparing/ready orders. Opening table sessions, closing bills and recording payments are not implemented yet. See DESIGN.md for the latest Pinterest-inspired component direction, using red instead of green.

## Menu images on Neon

The public-read restaurant-menu-images bucket is declared in neon.ts. Run neon deploy
to provision it on the linked branch and pull AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
AWS_ENDPOINT_URL_S3 and AWS_REGION into the ignored .env file. Keep credentials server-only.
For Vercel, configure the same branch-specific variables in the deployment environment.

Menu photos are optional: create a menu with only its name and price, then add an image later.
Admin Menu accepts JPG, PNG and WebP files up to 3 MiB. Image changes take effect when
the menu form is saved. The server checks file size and signature, uploads under a new UUID
key, and updates the existing image_url column. Menu images store object keys rather than
signed URLs, and reads resolve them against the current branch endpoint. Existing HTTP(S)
image URLs remain readable. No database migration or seed is required.

Replacing/removing an image deletes the previous app-managed object after the database
commit. Failed database writes attempt to remove the newly uploaded object. Storage cleanup
failures are logged; old files may need manual cleanup. External image URLs are detached,
not deleted from third-party hosts. Image responses use immutable cache headers; a separate
CDN has not been configured. No test suite, build or real upload test was run for this change
at the owner's request; only source review and Neon provisioning were performed.


## Landing page and location

The homepage includes an animated hero, ordering workflow, existing feature links,
future-feature labels and a simulated location/contact section. No restaurant
address or opening hours are invented. Edit src/components/landing/location.ts to
add verified contact details and the Google Maps embed iframe src; keep the URL
empty to show the labeled placeholder. Directions links appear only after a valid
Google Maps URL is configured. Phone links require a valid tel: value.

Desktop motion follows scroll; narrow or short viewports use normal page flow.
Use the motion control to pause animations. Reduced-motion preferences are
respected, and the homepage needs no database request or additional dependency.
No unit tests were added or run for this change at the owner's request.

## Mobile admin and table QR

On narrow screens, Menu, Table and Overview rows use a card layout with touch-sized
controls instead of a wide scrolling table. Desktop layouts retain table columns.
In Admin Table, choose ดู QR for any configured table to preview/download its code
or copy its order link. The QR target is /order/<table-code> on the chosen website origin.
The dialog starts with the current browser origin; edit URL เว็บไซต์ร้าน to use a public
deployment or a LAN-reachable address. Loopback hosts are rejected because phones cannot
reach this app through the computer's localhost. The selected origin persists across
table dialogs until the page unmounts. No QR database records or migrations are needed.
PNG files contain the QR itself; filenames include the table code.
These UI changes were source-reviewed only; tests/build and real-device QR scans were not run.
