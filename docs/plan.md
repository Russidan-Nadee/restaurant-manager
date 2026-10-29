# Restaurant Manager — Current Scope

## Implemented foundation

- Next.js App Router with Neon PostgreSQL; `pg` runs only on the Node.js server.
- Five restaurant tables and an atomic `place_order` SQL function in
  `db/migrations/001_restaurant.sql`.
- `GET /api/health` checks the database on each request.
- `POST /api/orders` validates input and calculates prices from the database.
- `src/lib/orders.ts` calls that API without exposing database credentials.
- Homepage displays Your name Restaurant without summary boxes or placeholder descriptions.
- Repeatable migrations and a real HTTP/database integration check.

## Next application features

- Customer QR menu, cart and order confirmation.
- Kitchen order board; decide on polling or realtime when implementing it.
- Authenticated admin menu/table management and QR generation.
- Checkout, reporting, Excel/Google Sheets integration.
- Optional Object Storage and payment demo later.

The initial Supabase plan has been superseded. No Supabase client, RLS roles,
Realtime publication or Supabase-specific database setup is required.

## Design direction

Use DESIGN.md (Scarpetta reference), lucide-react icons and no emoji. Start the next functional milestone with customer and kitchen views, subject to scope confirmation.

## Customer ordering foundation

- /order lists real three-digit table numbers from the database.
- /order/[tableCode] shows only real, active menu items and submits through the existing order API.
- Migration 002 configures the owner's initial tables 001–005. Additional three-digit table numbers are read dynamically, not hardcoded in the UI.
- No menu, image, price or order fixtures are inserted. Empty menus remain empty.
- /kitchen displays pending orders as table/menu/quantity rows and refreshes every five seconds.
- Admin menu/table management and kitchen status controls are still future work.
- Tests and builds were not run for this UI iteration at the user's request.

## Admin entry points

- /admin is the Overview landing page.
- /admin/menu lists real menu data, prices and availability, including closed items.
- /admin/tables lists real tables and their order-page links.
- Shared navigation links both sections plus /order and /kitchen.
- These are read-only views; data editing and authentication have not been added.

## Admin navigation

- Overview: /admin (initial admin page, no redirect).
- Menu: /admin/menu.
- Table: /admin/tables.
- Employee: /admin/employees, initially a page shell without employee records or mutation controls.

## Overview dashboard

/admin shows actual order counts for the Bangkok calendar day, all pending placed orders, active menu count, table count and the latest 10 orders. No sales or employee metrics are invented. Database errors use the admin error boundary rather than fabricated zero values. Tests/build were not run at the owner's request.

## Restaurant visual identity

The owner requested a stronger red/white restaurant style. The homepage, customer menu, kitchen board and admin shell now use tomato-red brand fields, warm-white menu surfaces, Cormorant Garamond lettering and Thai-capable Noto Sans Thai interface type. No data, images or business behavior were added. Tests/build were not run as requested.

## Cashier and latest visual direction

- /cashier shows all real three-digit tables as vacant/occupied tiles. Occupied currently means an existing order in placed, preparing or ready status; table-session and bill closing logic do not exist yet.
- Cashier and kitchen refresh every five seconds using the shared LiveRefresh component. Database failures never fabricate a vacant table state.
- Admin links to cashier as well as order/kitchen.
- Pinterest reference 1102537552561117698 supplies mood/component cues only: ivory background, white/beige rounded surfaces, dark navy text and red replacing olive green. No reference photos or business data are copied.
- Tests/build were not run at the owner's request.

## Admin menu editing and Neon uploads

- /admin/menu now has add/edit forms for name, description, price and availability.
- Each real menu row has edit and explicit open/close-sale controls. Menus are retained for order history.
- Users select local JPG/PNG/WebP images up to 3 MiB, preview, replace or remove them before saving.
- Server Actions validate inputs, use parameterized PostgreSQL writes and revalidate menu/dashboard/customer paths.
- The existing menu_items.image_url column stores Neon object keys. No schema migration or seed is needed.
- neon.ts declares the public-read restaurant-menu-images bucket; neon deploy provisioned it on production and pulled storage env vars into .env.
- Images upload before DB writes. Updates lock the row and commit before removing old managed images. Cleanup failures are logged.
- Login/authorization, category editing, hard menu deletion, a separate image CDN and automatic orphan retries are outside this change.
- Tests/build/type checks and real upload tests were not run under the owner's existing instruction. No unit tests were added.

## Mobile admin tables and customer QR

- Menu, Table and recent-order tables use labeled card rows on mobile with no duplicate interactive controls.
- Admin Table reads actual configured tables and opens a per-table native QR dialog.
- qrcode.react renders a black/white code with a four-module quiet zone; users can download PNG or copy the link.
- QR links use the selected website origin and /order/<table-code>. Browser origin is the default; localhost is rejected with instructions to use a public or LAN-reachable URL.
- QR generation needs no DB change. No new dependency was required.
- No tests/build, browser UI checks or real-device scans were run under the existing user instruction.

## Adding, naming and retiring tables

- Owner confirmed retirement hides a table while retaining history, and pending orders block retirement.
- Latest correction: customer-facing views show table numbers only. Display names are for admin only.
- Migration 003 adds display_name/is_active, initializes a non-cycling 001–999 sequence, and guards place_order with a table-row lock and active check.
- Admin Table now has native dialogs to add, name/clear a name and confirm retirement. Unnamed admin rows display muted numbers.
- QR URLs retain immutable codes; new codes never reuse retired ones. Active table queries, dashboard counts and cashier exclude retired rows.
- Retirement checks placed/preparing/ready under the same row lock used by order placement, preserving order history and preventing races.
- npm run db:migrate applied 003 to the configured Neon database. No fixture tables were created.
- No tests/build/type checks or live create/rename/retire flow were run under the existing user instruction. Future unit cases should be reviewed with the owner first.
