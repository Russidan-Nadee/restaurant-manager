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

Follow [DESIGN.md](DESIGN.md), adapted from Scarpetta. No emoji are allowed in project-authored content. Use lucide-react for UI icons. Customer ordering, kitchen, cashier and admin views are available; the landing page introduces the restaurant workflows with portfolio-inspired motion and a placeholder location section.

## Application routes

- /order: select a real table.
- /order/001 through /order/005: initial table ordering pages. Other three-digit table numbers work when configured in the database.
- /kitchen: table, dish and quantity board with automatic refresh.
- /admin: Overview dashboard with real order/menu/table counts and the latest orders.
- /admin/menu: add/edit real menus, change prices, open/close sales and upload/remove menu images.
- /admin/tables: add tables, set admin-only names, retire tables and preview/download each table QR.
- /admin/employees: interactive employee mockup with clearly labeled sample data.
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

The homepage offers a restaurant website to business owners, built for each
restaurant with a one-time website fee. It leads with an animated hero and live
website previews, followed by the audience story, a location example and a
contact invitation.
Contact buttons deliberately have no destination yet, as requested by the owner.
No package price or domain/hosting arrangement has been fixed in the copy.

The benefits section embeds the actual pages in lazy-loaded iframe previews:
the homepage hero, the cashier, the kitchen and admin menu management.
All four previews share a landscape iPad frame at public/landing/ipad-landscape.png.
The transparent screen overlays the actual iframe, so no screenshots are required.
This frame was prepared with built-in imagegen from the owner's iPad Pro 2018
mockup reference by Lstore Graphics. The original PSD files are not bundled.
The homepage uses /?preview=1 to show only the header and hero so the page
cannot embed itself recursively. The customer flow is reserved for later
showcase work. The separate /preview/menu route still redirects to the first
active table's ordering page, or /order when no active table is configured.
Previews block scripts, form submission and interaction; links open each full
page in a new tab. No orders, payments or menu changes are submitted by the previews.

The four-card scroll story introduces the owners the service is for: new
restaurants, established local favourites, social-first restaurants and owners
building their brand. It uses Lucide illustrations and keeps the existing
scroll-linked card animation. Feature details appear in the iframe section.

The lower map demonstrates a restaurant client's website. No restaurant address
or opening hours are invented. Edit src/components/landing/location.ts to add
verified restaurant details and the Google Maps embed iframe src; keep the URL
empty to show the labeled placeholder. Directions links appear only after a
valid Google Maps URL is configured. Phone links require a valid tel: value.

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

## Table management

Migration 003 adds nullable display_name and is_active to restaurant_tables, plus
a monotonic sequence for codes 001–999. Existing name values remain immutable QR
codes. New table codes are allocated automatically; retired codes are not reused.
The sequence can leave gaps after failed transactions. It never cycles back to 001.

Admin Table supports creating unnamed tables, setting/clearing an optional name
and confirming retirement. Table numbers and admin names use separate columns. The name column shows
the admin name, or a muted table number when no name has been set. Customer pages, QR sheets, kitchen
and cashier continue to use table numbers only. Customer queries never fetch display_name.

Retirement hides a table from admin, customer selection and cashier without deleting
the table or past orders. Orders in placed/preparing/ready prevent retirement.
The order function and retirement operation lock the same table row to serialize
concurrent order placement and retirement. Retired table order URLs return not found,
and the order function rejects stale submissions. There is no restore UI yet.

Migration 003 was applied with npm run db:migrate. No new tables were inserted on
the owner's behalf, and no tests/build or create/rename/retire UI flow was run.

## Food options

Open /admin/menu, choose แก้ไข for a dish, then select its available proteins
(ไก่, หมู, เนื้อ, กุ้ง, หมึก) and optionally enable พิเศษ +10 บาทต่อจาน.
Protein choices use the menu's base price. These settings are independent for
each menu, so water and ice can remain without options. The menu list summarizes
the saved choices; ไม่มีตัวเลือกเพิ่มเติม means neither option is enabled.
Existing menus are not automatically opted in.

Customers press + on /order/<table-code> to open an options dialog (a bottom
sheet on mobile). A configured protein is required; special is optional.
Identical choices merge in the cart, while different proteins or portion sizes
stay on separate lines. Quantity can be adjusted before sending.

The database validates the current menu availability, allowed options and price
atomically. Order items retain protein, portion and surcharge snapshots for the
kitchen and recent-order overview. Migration 004_menu_options.sql is already
applied on the configured Neon database; do not edit an applied migration.

Read-only inspection on 2026-10-29 confirmed its checksum, five option columns
and installed order-function body match the repository. All 12 existing menus
had options disabled at inspection time; no live menu settings were changed.
ESLint and TypeScript were checked. No unit tests, build or browser/order flow
were run; review unit-test cases with the owner before adding tests.

## Table and food workflows

Configure statuses in /admin/statuses. Required table states are ว่าง and
มีลูกค้า; required food states are รอทำ and พร้อมเสิร์ฟ. Optional เสิร์ฟแล้ว
starts as the final food state. There is no กำลังทำ state.

Add custom steps after an existing step and use the arrows to reorder them.
Table steps follow มีลูกค้า and eventually return to ว่าง. Food starts at
รอทำ and ends at the final configured step; เสิร์ฟแล้ว stays last while enabled.
Required states cannot be removed. A status currently assigned to an active
table/food line cannot be removed. Removal retains historical references.
Food workflow changes require no unfinished food; changes to the final step
also require closing visits that still use that final step.

The first successful customer order opens a visit automatically. Additional
orders join the same visit. Free tables cannot be selected in /cashier. Food
lines advance independently in /kitchen; cashier only monitors their states.
Kitchen hides completed food lines; cashier retains them until the visit closes.
Live refresh runs every five seconds.

Food completion does not free the table. Cashier shows the total of all orders
in the current visit. Once all food is complete, choose ชำระเงิน and confirm
receipt of the displayed amount. This records payment, closes the visit and
immediately makes the table free, including from a custom table state. Orders are
rejected during custom post-service table states until the table is free again.
Retiring a table requires its visit to be closed, even if all food is complete.

Migration 005_workflow_statuses.sql introduces status definitions, table visits,
per-food state IDs and a rotating table-state token. Existing pending orders
are grouped into visits; legacy preparing is mapped to waiting. The migration
preserves migration004's authoritative price/option/snapshot function and wraps
it atomically. State/session/token checks reject stale or repeated transitions.

Authentication, payment-gateway integration, cancellations, undo and splitting a food line's
quantity into separate serving states are outside this change. No mock business
records or new dependencies are needed. Review unit-test cases with the owner
before introducing tests for status protection, stale forms and visit closure.

Workflow rollout on 2026-10-29: migration005 was applied first on the temporary
workflow-statuses-20261029 branch and then production. Its checksum and required
schema/states were read back successfully. The temporary branch expires at
2026-10-29T05:53:15Z. ESLint and TypeScript exited 0; independent source review
approved the integration. No build, browser flow or automated tests were run.

### Manual payment records

Migration006 adds table_payments, with one immutable payment record per visit.
No payment records are seeded or inferred for previously closed visits. The
checkout transaction rechecks the current visit, rotating state token, final food
states and authoritative DB total. It rejects stale/duplicate payments or changed
amounts without closing the table. Money comparison uses integer cents, and the
display retains exact decimal precision. Zero-total visits are allowed.

Confirm only after receiving payment. This is a manual receipt acknowledgement;
no gateway request, bank transfer or card charge is performed. Ordinary table-state
actions cannot bypass payment to return an occupied table to free. Pending food
blocks checkout in both UI and server. Closed/paid order history remains intact.

Payment rollout on 2026-10-29: migration006 was applied on the temporary branch
and production. Its checksum, five columns and unique visit constraint were
read back successfully. Lint/types and independent source review passed. No
sample receipts, unit tests, build or browser checkout flow were run.

The cashier uses themed top-view tables. Selecting an occupied table opens one
bill dialog with actual line totals, a scrolling receipt and bottom total/actions.
Options and food statuses are secondary. Free tables are disabled. Confirmation
stays in the same dialog; short screens can scroll to all controls. No browser
flow or build was run; final lint and TypeScript checks exited 0.

## Employees

/admin/employees is an interactive mockup, as requested by the owner. Five
clearly labeled sample profiles use generic names and non-dialable placeholder
phone numbers. Users can add/edit profiles or toggle working status in local
React state. Reloading the page restores the initial samples.

There are no employee database reads/writes, browser storage, Server Actions or
authentication. The previously applied employees schema remains untouched for a
future backend; no fake staff records are seeded into Neon. Other operational
pages retain their actual database connections. Lint and TypeScript passed;
no unit tests, build or browser flow were run. Review future unit-test cases with
the owner before adding tests.
