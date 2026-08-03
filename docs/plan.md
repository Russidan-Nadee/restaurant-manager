# table-order — First Draft Plan

Demo QR table-ordering app for a single restaurant. No login anywhere, no in-app payment. Red visual theme.

## Scope

- **Customer**: scan a QR code stuck on the table → land on `/order/<tableId>` → browse menu by category (name, price, image, no variants) → add to cart → place order. Sold-out items hidden/disabled.
- **Kitchen**: `/kitchen` shows incoming orders live (table + items) via Supabase Realtime, with a sound alert on new orders. Single order state ("placed") — no multi-stage status.
- **Admin** (no login): menu CRUD + active/inactive toggle, table CRUD with custom names, per-table QR code generation (download/print), read-only order history.
- **Data**: Supabase (Postgres + Realtime). No Supabase Storage — see decision log below.

## Decisions made (with reasoning)

- **Path param over query param for the customer route** (`/order/[tableId]` not `/order?table=`): QR codes encode a clean absolute URL; path segments are the idiomatic "one URL per resource" pattern; enables a clean `notFound()` for invalid/deleted tables.
- **No Prisma** — stayed on `supabase-js` only. Reasoning: (1) Realtime (kitchen board) and any future Storage use aren't covered by Prisma at all, so Prisma would just be a second data-access layer alongside supabase-js, not a replacement. (2) Customers place orders directly from the browser with the `anon` key, protected by RLS policies + the `place_order` Postgres function — that pattern is Supabase-client-specific; Prisma always connects as a superuser and doesn't fit a browser-side insert. (3) First-draft scope doesn't need an ORM's type-generation machinery for this amount of CRUD.
- **No Supabase Storage / file upload** — admin pastes an image URL directly into a text field instead of uploading a file. Removes the need to create a Storage bucket (one less manual Supabase setup step) and removes `next.config.ts` `images.remotePatterns` config; menu photos render via plain `<img>` instead of `next/image` since the URL can be from anywhere.
- **Order placement is one atomic Postgres RPC** (`place_order`) rather than client-side inserts — re-validates each item's current price/`is_active` server-side so a stale cart or tampered price can never produce a bad order, and the whole order rolls back if anything is invalid.
- **`name_snapshot` / `price_snapshot` on `order_items`** — freezes the item's name/price at order time so later menu edits/deletes don't corrupt historical orders (needed for the order-history page).
- **RLS stays on everywhere**; `anon` gets `select` on all 5 tables plus `insert` on `orders`/`order_items` only. Admin writes (menu/table CRUD) go through a service-role client used only inside Server Actions — the browser can never mutate menu/table data directly, even without a login system.
- **Kitchen audio**: browsers block unprompted audio, so `/kitchen` shows a one-time "Enable Sound" button on load to unlock playback via a user gesture; after that, Realtime-triggered order events play the alert automatically for the rest of the tab session. Assumes the kitchen screen/tablet stays open on that tab — no Web Push / service worker needed.
- **Categories have no dedicated admin page** — managed inline on `/admin/menu` (simple add-category input + list) since the scope only needs grouping, not full category CRUD.

## Supabase schema

See [`supabase/schema.sql`](../supabase/schema.sql) — the source of truth for table DDL, the `place_order` function, and RLS policies. Run it in the Supabase SQL editor for a fresh project. Manual one-time steps after running it are noted at the bottom of that file (Realtime replication on `orders`; Storage bucket step is no longer needed per the decision above).

## Route structure

```
order/[tableId]/page.tsx           Server Component: notFound() if table missing, fetch categories+items
order/[tableId]/menu-and-cart.tsx  'use client': category tabs, item grid, cart drawer, place-order call
order/[tableId]/cart-context.tsx  'use client': cart state, persisted to localStorage as cart:<tableId>
order/[tableId]/not-found.tsx

kitchen/page.tsx                   Server Component: initial recent-orders fetch
kitchen/kitchen-board.tsx          'use client': Supabase Realtime subscription + audio alert + live list

admin/layout.tsx                   nav: Menu / Tables / Orders
admin/menu/page.tsx + actions.ts   list + CRUD server actions (menu_items, inline category add)
admin/tables/page.tsx + actions.ts list + CRUD server actions (restaurant_tables)
admin/tables/[tableId]/qr/page.tsx + qr-view.tsx   QR display + download/print
admin/orders/page.tsx              Server Component: read-only recent order history, newest first
```

## Supabase client setup

- `src/lib/supabase/client.ts` — browser client (anon key): cart/order-placement, kitchen Realtime subscription.
- `src/lib/supabase/server.ts` — server-side client (anon key): Server Component reads.
- `src/lib/supabase/admin.ts` — service-role client, guarded with `import "server-only"`; used only inside `admin/**/actions.ts`.
- `src/lib/types.ts` — shared types (`Category`, `MenuItem`, `RestaurantTable`, `Order`, `OrderItem`, `CartItem`).
- `src/lib/orders.ts` — `placeOrder()` wrapping the `place_order` RPC call.

## QR generation

`qrcode.react` — `QRCodeCanvas` for PNG download, `QRCodeSVG` for a crisp printable version. Encoded value: `${NEXT_PUBLIC_SITE_URL}/order/<table.id>`.

## Red theme

Extend the existing `@theme inline` block in `src/app/globals.css` with `--color-primary` (`#dc2626`), `--color-primary-dark` (`#b91c1c`), `--color-primary-light` (`#fee2e2`), `--color-primary-foreground` (`#ffffff`). Drop the `prefers-color-scheme: dark` override for this draft so red branding stays consistent.

## Env vars (`.env`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Dashboard → Project Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Dashboard → Project Settings → API — server-only, never NEXT_PUBLIC_>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`DATABASE_URL` (direct Postgres connection string) already exists in `.env` from Supabase's connect wizard but is unused by this app — it's not needed since there's no Prisma/direct-Postgres client, only `supabase-js`.

## Progress

- [x] `supabase/schema.sql`
- [x] `src/lib/types.ts`, `src/lib/supabase/{client,server,admin}.ts`, `src/lib/orders.ts`
- [ ] Fill in real Supabase API keys in `.env` (blocked on user retrieving them from the dashboard)
- [ ] `next.config.ts` — no longer needs `images.remotePatterns` (Storage dropped)
- [ ] Red theme in `globals.css` + landing page copy
- [ ] Customer order page (menu + cart)
- [ ] Kitchen realtime display page
- [ ] Admin menu management page
- [ ] Admin table management + QR page
- [ ] Admin order history page
- [ ] `npm run lint` / `npm run build` verification

## Verification (once keys are in place)

1. `npm run build` and `npm run lint` pass with no errors.
2. Seed one table + one category + one menu item via `/admin/menu` and `/admin/tables`.
3. Open `/admin/tables/<id>/qr`, confirm a QR renders and downloads as PNG.
4. Open `/order/<tableId>`, add an item, place an order, confirm confirmation state + cart clears.
5. Open `/kitchen` first, click "Enable Sound", then place another order — confirm it appears live with sound, no refresh needed.
6. Open `/admin/orders`, confirm both orders are listed with correct items/totals.
7. Toggle a menu item to inactive, confirm it disappears/disables on the customer page and a stale cart containing it is rejected with a clear error.
