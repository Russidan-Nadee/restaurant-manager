# Menu management implementation plan

Goal: Let the owner manage real menus and local image uploads from Admin Menu.
Architecture: Next.js Server Actions validate form data, write to existing Neon Postgres
tables and upload/delete images using the S3-compatible Neon Object Storage endpoint.
Scope approved in conversation: add menus, edit name/description/price, open/close sales,
upload/remove local images using Neon. No seed, schema change, hard menu deletion or auth.
Constraints: Follow DESIGN.md, no emoji/mock business data, no tests/build under the owner's instruction.

- [x] Add server-side menu validation and parameterized create/update/availability writes in src/lib/menu-management.ts.
- [x] Declare/provision restaurant-menu-images in neon.ts and wire server-only AWS_* credentials in src/lib/menu-images.ts.
- [x] Add src/app/admin/menu/actions.ts with validation, upload-before-write, commit-before-cleanup and revalidation.
- [x] Replace the read-only menu view with MenuManager.tsx, MenuEditor.tsx, types.ts and menu.module.css.
- [x] Resolve stored keys for admin/customer image rendering without changing the schema.
- [x] Update README, DESIGN and docs/plan with current behavior and setup.
- [x] Review source and provisioning output without running tests/build.
- [ ] With future user authorization, design unit cases together and verify a real upload/edit/remove flow.
