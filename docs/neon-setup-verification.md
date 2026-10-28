# Neon setup verification — 2026-10-28

Project: quiet-bonus-16300508; org: org-small-mouse-78424052.
Application branch: production (br-solitary-bird-aodddbjr). Only Postgres was requested and provisioned.

## Changes

- Installed Neon CLI 8.13.1, completed browser login, linked this checkout in the gitignored .neon file.
- Added neon.ts. neon deploy confirmed the branch matched the policy and pulled DATABASE_URL, DATABASE_URL_UNPOOLED and NEON_BRANCH into the gitignored .env.
- Replaced Supabase clients with a server-only pg pool; registered pool lifecycle with @vercel/functions.
- Added five restaurant tables and atomic database-side order placement through a checksummed, transactional SQL migration.
- Added DB-backed homepage counts, GET /api/health and POST /api/orders. Client order requests contain IDs and quantities; prices come from the database.
- Added db:migrate, typecheck and verify:neon scripts. The user chose integration verification without adding unit tests.
- Normalized SQL line endings before migration checksums and enforced LF in .gitattributes.
- Updated Next.js and eslint-config-next from 16.2.12 to 16.4.3. Applied a scoped same-major Zod override and non-force npm audit fixes.

## Provisioning output

```text
Applying to branch production (br-solitary-bird-aodddbjr)
No changes — branch production already matches the policy.
Utilized services: Postgres
Pulled 3 Neon variables into .env
```

## Verification

Migration was tested on an expiring child branch before applying to production.
A second production migration run reported Already applied: 001_restaurant.sql.

npm run lint, npm run typecheck and git diff --check exited 0.
npm audit fix exited 0 with found 0 vulnerabilities.

Final npm run build used next build --webpack and exited 0:

```text
Next.js 16.4.3 (webpack)
Compiled successfully in 11.8s
Finished TypeScript in 2.5s
Generating static pages using 7 workers (4/4)
Route (app)
  /
  /api/health
  /api/orders
  /_not-found
```

Started the production build with:

```sh
npm run start -- --hostname 127.0.0.1 --port 3102
npm run verify:neon -- --base-url http://127.0.0.1:3102
```

The verification command exited 0 on both the validation branch and production:

```text
PASS HTTP health -> app -> Neon PostgreSQL
PASS homepage renders restaurant data from Neon
PASS HTTP order -> DB write/read: quantity 2 x DB price 125.50 = 251.00; supplied price ignored
PASS rejects empty cart
PASS rejects invalid quantity
PASS rejects unavailable menu
PASS rejects unknown table
PASS malformed JSON rejected; rejected orders leave no partial writes
PASS historical item name/price preserved after menu changes
PASS verification fixtures removed
```

The homepage assertion compares its rendered counts with live database counts.
Independent code review confirmed the migration-checksum and homepage-assertion fixes.
After cleanup, GET /api/health still returned status=ok and services.postgres=ok.

## Failures and recovery

- The first neon init stopped because installation of the optional GitHub Copilot CLI plugin failed. Codex's plugin was installed. Retrying init with --no-agent-setup completed the project setup.
- An initial temporary setup helper had a JavaScript template quoting error. It was corrected before application files were written.
- npm audit initially reported a critical advisory in the pre-existing Next.js version and high advisories in transitive packages. The same-major updates and scoped fixes reduced the final audit to zero reported vulnerabilities.
- Windows Application Control blocks the new native SWC binary. Default Turbopack cannot use the WASM fallback, so that build failed. The documented Webpack fallback passes; dev/build scripts now use --webpack. A nonfatal native-SWC warning still appears. No Windows policy was changed.

## Cleanup and scope

- Verification fixtures were removed from both databases.
- The temporary restaurant-manager-setup-check branch and its .env.neon-check file were deleted.
- The validation app was stopped. The production-connected app was left running at http://127.0.0.1:3102.
- No Auth, Object Storage, Realtime, LINE, spreadsheet or payment services were added.
- Full customer/cart, kitchen and admin screens remain future application work.
- No Git commit, push or hosting deployment was performed.
