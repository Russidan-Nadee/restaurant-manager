# Configurable restaurant statuses

The owner authorized the design and implementation. No preparing state.
Required table states: ว่าง and มีลูกค้า. Required food states: รอทำ and
พร้อมเสิร์ฟ. Seed optional เสิร์ฟแล้ว as the final food step.

## Configuration

Admin /admin/statuses manages two ordered workflows with add, remove and move
controls. Required states cannot be deleted. Table free/occupied stay first;
food waiting stays first. Optional served stays last while configured. Custom
steps can be inserted/reordered inside these boundaries. The final active food
step completes a food line. Removing a state is soft deletion and prohibited
while active tables or food lines reference it; historical references remain.
Adding/reordering food steps is prohibited while any visit has unfinished food,
so a live ticket cannot change its remaining steps halfway through service.

## Runtime

Kitchen advances individual food lines. Cashier shows the table's actual state,
the current visit's orders and food controls for serving. A visit opens manually
or automatically on its first order. Sending another order attaches to that same
open visit. After all food reaches the final step, staff may advance table states
and explicitly close the visit to make the table free. Closure means operational
table closure only; no payment or paid claim. Custom table states follow occupied
and loop back to free; ordering is allowed only when free/occupied.

Food completion never frees a table. Table retirement is blocked for any open
visit, including a visit with all food served. Closed visits/order details remain.

## Data and races

Migration 005 adds restaurant_statuses, table_sessions, table status IDs, food
status IDs and order session IDs. Legacy placed/preparing map to waiting; ready
maps to ready; other historical food maps to served without opening visits.
Existing open orders are grouped into one open visit per table.
Preserve the existing authoritative menu-option order function under a versioned
name and wrap it with visit creation and status locking. A shared transactional
advisory lock serializes workflow configuration, placement, progression and table
retirement. Runtime requests include expected state, next state and visit ID to
reject stale/repeated updates instead of progressing twice.

## UI and verification

Keep existing red/ivory/navy design and Lucide icons, no emoji or invented data.
Accessible native add dialog, mobile cards and 44px controls. Existing live refresh
updates operational screens. Authentication/payment are outside this scope.
No new unit tests or automated runtime tests per the user's instruction. Run
lint/types, review source and migration metadata. Apply only this migration;
preserve concurrent homepage/documentation edits. Do not commit or push.

Table forms also carry a rotating state token. Matching a free state and empty
visit alone is insufficient after a full open/close cycle; token rotation rejects
stale free-table replay after that cycle.

## Owner correction — cashier payment

This supersedes the original shared food controls and non-payment closure design.
Food progression belongs only to kitchen UI. Cashier monitors food states and
shows the authoritative current-visit total. User confirmed all food must reach
the final step before checkout. A native receipt-confirmation dialog records one
manual payment, marks orders paid, closes the visit and immediately frees the
table atomically. No non-payment close action remains for occupied tables.
Expected visit/token/amount prevent stale checkout and duplicate receipt records.
Migration006 adds payment records without backfilling historical visits.
