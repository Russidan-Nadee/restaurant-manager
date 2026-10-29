# Your name Restaurant — Design Guidelines

Reference: Scarpetta Theme by Veronica G
Source: https://www.veronicag.com/themes/scarpetta
Downloaded source: https://www.veronicag.com/api/theme-files/scarpetta?kind=all
Updated: 2026-10-28

## Project rules — take precedence over the reference

### No emoji — mandatory

ห้ามใช้ emoji เด็ดขาดในทุกส่วนที่เขียนขึ้นสำหรับโปรเจกต์นี้
No emoji in project-authored UI, button/menu labels, notifications, status text,
empty states, demo/seed content, code comments or Markdown documentation.
Do not substitute Unicode pictographs, emoji fonts, stickers or emoji images
for interface icons. Use plain text and the approved SVG icon components.

### One icon pack: Lucide React

Use lucide-react as the only interface icon library. It is installed in package.json.
Documentation: https://lucide.dev/guide/react
Accessibility: https://lucide.dev/guide/react/advanced/accessibility

- Import only the named icons needed by a component; do not import the entire icon registry.
- Default visual style: outline SVG, currentColor, 20px or 24px, strokeWidth 1.75.
- Keep the same stroke style and size within the same group of controls.
- Use text labels for primary actions. Decorative icons are aria-hidden.
- An icon-only button needs an accessible name on the button and a touch target of at least 44px.
- Do not combine Lucide with another UI icon pack, icon fonts or emoji.
- Candidate icons: UtensilsCrossed for food, ClipboardList for orders,
  Armchair for dining tables, Plus/Minus for quantity, Check for confirmation and Clock for progress.

### Brand and current homepage

- Display the restaurant name exactly as: Your name Restaurant.
- Keep the repository/package name restaurant-manager; the display name is separate.
- Remove the previous summary/statistic boxes from the homepage.
- Do not show the previous tagline or the previous English no-menu message.
- The current homepage is a minimal name-only starting point, not an admin dashboard.

### First functional milestone — approved scope

Begin with a single restaurant and two operational views, as confirmed by the owner:

1. Customer: scan a table QR, view available dishes, choose quantities and send an order.
2. Kitchen: read table numbers, dishes and quantities. Keep this first view free of action buttons; status controls can follow later.

The admin landing page is Overview at /admin, a dashboard showing real restaurant metrics and recent orders, not a directory of navigation links. Navigation order is Overview, Menu, Table, Employee. Menu and Table read real database records; Employee starts as a page shell with no mock data. The admin area links to both operational views. Menu management supports adding/editing names, descriptions and prices, opening/closing sales, and uploading/removing menu photos. Table management supports adding, naming and retiring tables; authentication remains future work.

Keep checkout, payment, inventory, Excel, Google Sheets
and LINE integrations for later milestones. Do not turn the first release into a POS suite.
The customer view prioritizes phone use; the kitchen view prioritizes quick reading on a tablet or desktop.
Use clear text status labels and a visible last-updated/error state when live data is introduced.

### Current visual direction — modern restaurant components

Latest reference: https://www.pinterest.com/pin/1102537552561117698/
Use only its mood and component language, not an exact recreation.
Use a warm ivory canvas #F7F3EB, white surfaces, soft beige secondary surfaces,
deep navy text #142033 and tomato red #C7342B in place of the reference's olive green.
Keep corners around 16–24px, controls pill-shaped, borders light and shadows restrained.
Use Plus Jakarta Sans for compact brand lettering and Noto Sans Thai for Thai UI.
Do not use the previous oversized italic wordmark or full red outer frames.
Product cards can show actual food images only when the database supplies them.
Do not copy the chef photograph, restaurant collection images, location, reviews, ratings,
marketing copy or illustrations from Pinterest. Do not add nonfunctional search or promotion controls.
Admin uses an ivory sidebar and mobile navigation header against a white main canvas.
Sidebar navigation uses text labels without menu or brand icons; align the collapse control beside the restaurant name.
On mobile, admin Menu, Table and Overview rows become readable cards with labels and 44px controls; retain table columns on desktop.
Admin Table offers QR preview and PNG download for the actual configured table order URL.
Optional table names are admin-only and have a separate column from table numbers. The name column falls back to a muted table number; customer-facing views and QR sheets show only the number. Renaming never changes QR URLs.
Kitchen remains easy to scan.
Cashier shows real table tiles with explicit vacant/occupied text and red occupied accents.
Until table sessions and billing are implemented, cashier occupancy is inferred from existing
orders with placed/preparing/ready status. Explain this limitation; do not invent seated customers.
The homepage remains name-only. No emoji or mock business data.
This latest direction overrides the original Scarpetta styling wherever they differ.
### Apply the visual reference to an ordering app

- Follow the modern component direction above and use food imagery only when actual assets exist.
- Prefer open layouts, ruled menu rows and generous spacing over a grid of dashboard cards.
- Do not copy Scarpetta's restaurant name, logo, contact details, prices or menu copy.
- Use the current sans serif typography for app headings and controls; retain clear restaurant-focused hierarchy.
- Provide a Thai-capable sans serif for Thai UI; do not apply Latin tracking or uppercase rules to Thai.
- Treat the reference's 10px micro labels and large 76px headings as editorial presets,
  not defaults for operational controls. Use readable body/control sizes around 16px.
- Ordering and kitchen actions must remain stable and immediate: no scroll pinning,
  automatic carousels or decorative parallax around buttons, totals or order statuses.
- Reduced-motion preferences must be respected.
- Use actual available food photos with meaningful alt text; preserve image aspect ratios.
- Images, font files, artwork and recreation assets referenced below are from the
  original Scarpetta project. They were NOT included in this app by downloading the theme Markdown.
  Do not import nonexistent relative asset paths. Obtain or create appropriate assets when needed.

## Reference theme guidelines

The downloaded theme follows below as the design reference. The project rules above
override conflicting choices. Relative asset links and source-project paths in this
section describe the author's original theme, not this repository.

---
## Scarpetta Theme

An Italian restaurant theme with a warm paper canvas, deep sauce red, fine editorial serif type, photographed food, and a handwritten signature. Use this guide to extend the Scarpetta design; use the [complete recreation prompt](../SCARPETTA-RECREATION-PROMPT.md) for the exact homepage, copy, imagery, and motion sequence.

## Colour

These nine project tokens are retained in `code/project/colors.json`:

| Token | Hex | Use |
| --- | --- | --- |
| Ink | #1A1310 | Reading text and dark hero base |
| Espresso | #2E1F18 | Borders, dark accents |
| Cream | #F5EFE3 | Page canvas, light type, navigation |
| Cream Deep | #EAE0CE | Subtle secondary paper surface |
| Sauce | #8C1F14 | Main red menu/footer, primary buttons |
| Sauce Bright | #C0392B | Handwritten wordmark stroke |
| Olive | #6B7355 | Secondary natural accent |
| Olive Deep | #5A6247 | Author labels and microcopy |
| Brass | #B98A44 | Prices, fine rules, warm details |

Additional established treatments: puzzle paper #FAF6EC, pencil oval #B33A2B, hero dimming rgba(15,10,8,.22), mobile drawer rgba(41,27,21,.97). Transparent text/rules may use the token colour with opacity. Use cream text against sauce, and ink text against cream. Keep brass accents sparse.

## Typography

Use Cormorant Garamond for display headings, product titles, menu names, story years, and quotes; Plus Jakarta Sans for reading and interface copy; Special Elite for the puzzle. The script logo is a supplied SVG, not a font substitution. Local font files, licences, and [fonts.css](../assets/fonts/fonts.css) are included. The bundled TTFs come from the official Google Fonts repository and are compatible family sources, not an export of Framer's particular served font binaries.

| Role | Desktop | Tablet | Phone | Treatment |
| --- | --- | --- | --- | --- |
| Section heading | 76px | 56px | 40px | Cormorant 400, .95 line-height, -.02em tracking |
| Story year | 96px | 80px | 64px | Cormorant, centred; “today” italic |
| Footer invitation | 96px | 72px | 56px | Cormorant, tight leading |
| Quote | 38px | 34px | 30px | Cormorant, centred, max 450px |
| Product title | 28px | 28px | 28px | Cormorant 400, 1.15 leading, -.01em tracking |
| Menu dish | 24px | 24px | 24px | Cormorant, cream |
| Body preset | 17px | 17px | 17px | Jakarta 500, 1.7 leading, -.02em tracking |
| Menu description | 14px | 14px | 14px | Jakarta, cream 70% |
| Price | 16px | 16px | 16px | Jakarta semibold, brass |
| Micro label | 10px | 10px | 10px | Jakarta 600, uppercase, .12em tracking |

Source also retains a Hero Display preset at 148/96/58px, .88 leading, -.03em tracking, and Subhead at 24/21/18px, 1.35 leading. The current hero uses the handwritten SVG rather than this display-text preset. Font presets and individual overrides are recorded in `code/project/typography.json` and page/component JSON.

## Layout and spacing

Breakpoints: desktop≥1200px, tablet 810–1199px, phone≤809px. Content flows full width with inner limits around 1080–1140px. Standard section padding is roughly 150px 40px desktop,112px 32px tablet,80px 24px phone. The definition is more spacious on desktop; the menu has a narrower 560px reading column. Use 12–16px for small control/copy gaps,24–44px for content groups, and larger 48–80px gaps between compositions. The original sauce section intentionally has a 187px desktop heading-to-product gap.

Retain open compositions and large negative space. Product artwork sits directly on the cream canvas, without heavy cards. Stack the sauce products on phone. Menu categories remain stacked at every breakpoint. Reflow footer content into a two-column link grid on phone, with address/hours/newsletter stacked. Make width fluid before shrinking type, and check 320px.

## Components and surfaces

The fixed navigation is a translucent cream capsule with 32px radius,20px blur, and a subtle espresso border. Desktop/tablet links are compact; phone uses a 44px menu toggle and expands into a dark drawer. Primary buttons are sauce-red capsules with cream copy; footer reservations invert those colours. Use restrained hover feedback and visible focus states.

The story image pile has 13px corners and a viewport-sized sticky stage. The definition panel has 28px top corners on desktop/tablet,20px on phone. The puzzle paper has a tiny 2px radius and a -1.5° tilt. Shadows are soft, warm, and grounded. Sauce jar shadows are layered radial ellipses beneath transparent product artwork.

Decorations extend beyond section edges. Use clipped visual wrappers and pointer-events:none, but do not create an overflow ancestor that breaks sticky positioning. Keep food away from text, buttons, and price columns. Blur the large left bread 6px and menu tomato 2px for depth; leave the nearly normal-speed right bread sharp.

## Photography and artwork

Photography feels intimate and tactile: warm stone, tomato sauce, soft kitchen light, candlelit tables, and family history. Preserve gentle grain and warm, muted highlights. Do not add glossy stock-photo polish, neon colours, generic vector food, or unrelated dining scenes. Product jars and food accents are photographic transparent PNGs; preserve their cut-out edges. The logo and pencil mark remain vector strokes.

Use the original assets when exact reconstruction is desired. [Image prompts](imagePrompts.md) are optional guidance for new images in the same visual direction, not a promise of pixel-identical regeneration. Reference screenshots are guides, never flattened page artwork.

## Motion

The signature behaviours are scroll-scrubbed hero film, a drawn/fading wordmark, timed captions, a growing pinned three-generation photo pile, word-by-word colour changes, and independent ingredient parallax. Their full timing and implementation guidance live in the main prompt and original script. Keep motion linked to current scroll position and reversible. Do not replace it with a generic entrance animation.

Exact menu scroll-speed settings: left bread 114%, right bread 101%, basil 94%, chili 92%, tomato 112%. Normal page speed is 100%. On phone, hide the large breads/tomato and keep basil/chili peripheral. Use nested wrappers to preserve each item's rotation when its position animates.

Additional motion is restrained: jar hover rises 10px/scales 1.03 over.7s; testimonial rotates every 5s; in-view text can fade/resolve from a small blur. Use one smooth-scroll system at most. Pause unused work. Reduced motion reveals content without parallax, long pinning, stroke drawing, or automatic quote cycling.

## Reusable adaptation

Keep the cream/sauce contrast, serif/sans roles, authentic food photography, generous spacing, and independent depth layers when adapting the theme. Exact restaurant copy, contact details, menu prices, product names, and logo belong to the Scarpetta reference and should be replaced for another brand. New interfaces should preserve legible contrast,≥44px touch targets, semantic reading order, and keyboard navigation.


## Animated landing page — 2026-10-28

The owner approved replacing the name-only homepage with a complete animated
landing page. This supersedes previous homepage-only restrictions above.
Keep the ivory, tomato-red and navy identity, current fonts, exact display name,
Lucide icons and no-emoji rule. Portfolio CreativeHero and AiStoryPanel supply
motion references: floating UI cards, scroll-linked exits and a sticky four-step
ordering story. Operational routes retain their existing behavior.

The homepage introduces customer ordering, the read-only kitchen board, inferred
cashier occupancy, admin overview, menu management and table information. Payment,
stock, sales reports and staff authorization are clearly marked as future work.
UI illustrations contain no fake menus, prices, orders or business metrics.

The owner additionally requested a simulated map/contact section. It is visibly
labeled as a placeholder, with no invented address, hours, phone or live location.
Set verified public details in src/components/landing/location.ts. Copy Google
Maps iframe src into googleMapsEmbedUrl and a full Google Maps directions URL
into googleMapsDirectionsUrl; empty/invalid values retain the placeholder.
Only HTTPS www.google.com/maps or maps.google.com/maps URLs are accepted.

Animation uses native CSS and one requestAnimationFrame-scheduled scroll update,
without new dependencies. Desktop scroll scenes are limited to large, tall
viewports; mobile uses a normal document flow. Respect reduced motion, provide
a pause control and keep content available before JavaScript loads. Pause
continuous animation while the document is hidden.

No unit tests were added or run at the owner's request for this change.

### Food-option management

The admin menu list displays each menu's saved protein choices and special
portion surcharge in a separate ตัวเลือกอาหาร column, spanning the mobile card
width. Use muted text when neither is enabled and red text for the surcharge.
Configuration remains in the existing edit dialog; never enable choices on
live menus without the owner's instruction.
