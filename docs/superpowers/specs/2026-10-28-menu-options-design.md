# Menu options and mobile ordering

The customer presses + on a food card, then chooses options in a native dialog.
On a phone the dialog is a bottom sheet; larger screens use a centered modal.
Keep the existing ivory/red/navy identity, Thai typography and Lucide icons.

## Per-menu settings

Admin Menu selects available proteins from chicken (ไก่), pork (หมู), beef
(เนื้อ), shrimp (กุ้ง), squid (หมึก). Empty selection means no protein question.
Protein selection uses the existing menu price, without a new surcharge.
Each menu independently enables special portions at +10 THB per serving.
Existing menus retain empty protein choices and special disabled until configured.

## Customer flow

The dialog displays the actual menu photo/name, configured protein radios,
optional special checkbox, then quantity controls (initial 1, minimum 1).
Protein menus require an explicit selection. Confirm shows the total price and
adds the selected variant; dismissing the dialog leaves the cart unchanged.
Use native modal focus handling, Escape/backdrop close, body scroll locking,
focus restoration and controls at least 44px wide/high.

The menu page shows an editable cart. Identical menu/protein/special choices
merge; different choices remain separate. Plus/minus changes the corresponding
line and decreasing to zero removes it. Sending disables mutations; successful
submission clears the cart, failure preserves it. Do not add operational animation.

## Persistence

Store per-menu protein_options and special_available. The server validates
selected options against the current menu, reads authoritative prices, adds
10 per special serving, and saves protein/special snapshots on order items.
The kitchen board and admin recent orders display those snapshots. Historical
names/prices/options do not change when the menu is edited later.
Keep the existing atomic order function and active-table retirement locks.

## Verification and rollout

The user explicitly declined automated tests for this work. Use ESLint,
TypeScript and source review; no test code or sample business records.
Apply versioned migration 004 after already-applied 003. Do not run another
feature's pending migration or silently enable menu choices in live data.
