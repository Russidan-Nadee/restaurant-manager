# Restaurant Manager — Current Scope

## Implemented foundation

- Next.js App Router with Neon PostgreSQL; `pg` runs only on the Node.js server.
- Five restaurant tables and an atomic `place_order` SQL function in
  `db/migrations/001_restaurant.sql`.
- `GET /api/health` checks the database on each request.
- `POST /api/orders` validates input and calculates prices from the database.
- `src/lib/orders.ts` calls that API without exposing database credentials.
- Homepage reads table, active-menu and order counts from the database.
- Repeatable migrations and a real HTTP/database integration check.

## Next application features

- Customer QR menu, cart and order confirmation.
- Kitchen order board; decide on polling or realtime when implementing it.
- Authenticated admin menu/table management and QR generation.
- Checkout, reporting, Excel/Google Sheets integration.
- Optional Object Storage and payment demo later.

The initial Supabase plan has been superseded. No Supabase client, RLS roles,
Realtime publication or Supabase-specific database setup is required.
