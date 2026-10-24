# UNIQ FLOORS owner workspace

## Current state

The new workspace is at `/admin`. It uses the requested four-digit PIN rather than an owner email/password form. The PIN is stored as a salted scrypt hash in the local environment; the raw PIN is not committed or bundled into the browser. The reference design is implemented with locally hosted, OFL-licensed Urbanist, pale cyan and coral gradients, translucent white cards, black pill controls, and mobile navigation.

**Live activation is pending.** Automatic approval review rejected applying the persistent migration to the connected project because of its schema, permissions, seeded catalogue, and public media bucket changes. No part of that rejected migration was applied through another route. The local workspace deliberately opens a read-only public-data preview while the private server credential is absent. Unknown private-record counts appear as a dash, not invented metrics.

## Implemented workflows

- Products: create/edit drafts, publish/archive, SKU, categories, retail and comparison prices, explicit VAT confirmation, pack coverage, specifications, images, availability, stock count, reorder threshold, supplier and warehouse bin.
- LVT and carpets: edit all existing 80 ranges and colour variants, dimensions, roll widths, source links and specifications; add ranges/colours or hide them.
- Retailers: application details, private review notes, approval, rejection, suspension and reactivation. A database transaction synchronizes the application, profile and role.
- Website studio: hero headline, description, CTA, image/video; promotion creation, ordering, date scheduling, disabling and removal; save draft, inspect preview and publish.
- Media: owner-only uploads to a public storefront asset bucket, with file type and 10 MB limits. Public access is appropriate for storefront photography/video; private records are not put in this bucket.
- Customers and inbox: customer records, enquiry status/notes, sample dispatch and tracking, support status.
- Operations: deliveries, measures, fittings and collections with date/time, site address, assignee and job instructions.
- Documents: quotation creation with line items, delivery/discount and explicit tax, status updates, one draft invoice per quote, printable document view, immutable issued invoices. Documents are downloaded/sent manually; email delivery and card payments are not integrated.
- Business settings: contact details with an explicit public-contact toggle; payment instructions remain private. Approved public contacts feed storefront links.
- Staff: owner-approved developer invitations, revocation and an unlisted `/retailers/studio` route. Email verification and an active membership are required. Developer access does not grant owner permissions or customer-record access.
- Activity: database audit trail, search, pagination and page CSV exports. Exports neutralize spreadsheet formula prefixes.

## Prepared database migration

`supabase/migrations/20261015065631_owner_dashboard.sql` targets the existing project `isahlfzmswkeiitoiwbe` (display name: `flooruniq@gmail.com's Project`). This account email is not assigned as the website owner.

The migration adds protected content, range, staff, scheduling, audit and PIN-session records; expands product stock fields; adds transactional management functions; and creates the storefront media bucket. It imports the existing 12 storefront products, 7 categories (including Carpet), 80 source-backed ranges and current hero/promotions. Imported prices remain explicitly unverified until an owner saves and confirms them. Existing website prices are preserved as a transitional display fallback for those imported products.

Public product reads exclude supplier, stock and warehouse fields. Content drafts, administrative logs, retailer records and private company settings are not publicly readable. Every new public table has RLS. Private PIN-attempt/session tables are not exposed to browser roles.

## Activation steps after approval

1. Apply the prepared migration through the connected Supabase project and inspect security advisors.
2. Configure `SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`) in the **server environment only**. Never use a `NEXT_PUBLIC_` prefix or paste the key into a browser UI. The publishable key alone cannot perform PIN-authorized owner edits.
3. Keep the locally generated `OWNER_ACCESS_PIN_HASH` and `OWNER_ACCESS_SECRET` private. Add their values securely to the production environment when deploying. Rotating the signing secret invalidates existing cookies.
4. Restart the application, sign in at `/admin`, and verify a draft product save, content draft/publish, retailer review, image upload and sign-out against the activated backend. Archive any deliberately created live smoke-test product afterward.
5. Configure the site URL and allowlisted verification redirects in Supabase Auth before inviting developer or retailer accounts on a public domain.

The PIN session is signed, HttpOnly, SameSite Strict, Secure in production, expires after two hours and is revocable in the database. Live sign-in has a database-backed five-attempt/ten-minute limit. The memory-only limiter and public-data preview are restricted to development on localhost.

## Verification

- `npm test`: existing flooring/catalogue tests plus an isolated PostgreSQL-compatible PGlite database exercising the full migration, RLS, product transaction rollback, approvals/suspensions, developer revocation, draft privacy, invoice locking, storage policy, PIN budgets and session revocation.
- `npx tsc --noEmit` and `git diff --check`.
- `npm run build:vinext`.
- `OWNER_TEST_PIN=<local PIN> node scripts/check-owner-http.mjs`: localhost-only HTTP smoke check for anonymous denial, PIN validation, cookie attributes, origin checks and inability to elevate a preview session into product writes. This intentionally stops if the server is in live mode.
- Browser checks at desktop and 390 px: PIN-only login, overview, floating mobile navigation, product editor, range pagination and hero/promotion studio. No live backend write is claimed before activation.

PGlite tests use a minimal local Auth/Storage scaffold, not the complete Supabase gateway or mail system. Live REST/Auth/Storage acceptance checks remain necessary after activation.

## Workflow research

The scope follows flooring-specific operational needs: pack/roll quantities, samples, trade accounts, enquiries, quotes, deliveries and fitting rather than generic retail sales charts. Roll cutting optimisation, accounting synchronisation, payment collection and live vehicle GPS are future integrations, not simulated features in this workspace.

- [PlanIt Flooring](https://planitflooring.com/): stock on rolls/remnants, trade accounts, fitting diaries, quotations and customer documents.
- [FloorLogik](https://floorlogik.com/): trade/retail pricing, stock allocations and quote workflows.
- [Service Buddy inventory](https://www.servicebuddy.io/features/inventory-labels): flooring-specific stock connected to quotes and jobs.
- [Supabase SSR authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client): server-verified sessions for retailer/staff accounts.
- [Supabase row security](https://supabase.com/docs/guides/database/postgres/row-level-security): private records and scoped access.
- [PGlite API](https://pglite.dev/docs/api): isolated migration and permission tests.
