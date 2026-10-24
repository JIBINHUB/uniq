# Verification — initial platform stage (historical)

This records the initial platform stage. For the current live deployment, use the [16 October implementation audit](IMPLEMENTATION-AUDIT-2026-10-16.md).

## Passed

- Authenticated Supabase discovery: target project active, London region.
- Database inspection: zero public application tables, Auth users and storage buckets.
- Cloudflare inspection: existing uniq-floors Worker and both current domain hostnames confirmed.
- Three financial unit tests: exact pack boundaries, differing coverage, invalid input, integer-pence pricing, quotation discount/delivery/VAT arithmetic.
- TypeScript: npx tsc --noEmit --incremental false.
- Source whitespace: git diff --check.
- Cloudflare production compiler: npm run build:vinext completed all five stages, including the admin API routes.
- Next development runtime: unauthenticated GET /api/admin/overview returned HTTP 401 with Cache-Control: private, no-store.
- Local Workers runtime on port 4176: same endpoint returned HTTP 401 with private, no-store.
- Browser: /admin rendered business email/password login. Screenshot saved at /private/tmp/uniq-admin-workspace.png.
- After explicit user approval, the migration applied successfully; all 24 application tables have RLS enabled.
- Database tests passed: anonymous customer read denial, non-admin settings write denial, two-owner customer isolation and issued invoice/line immutability. Fixtures were rolled back.
- Owner dashboard redesigned for desktop/mobile using the supplied soft white card references; 390px mobile layout and floating-dock navigation verified.
- Supplied testing PIN unlocks the local read-only preview. A separate unauthenticated preview request returns 401. PIN and signing secret are in ignored local environment configuration, never in client source.
- Wrong PIN rejected in the browser; locking returns to the PIN form. Fresh compiled production Worker returns JSON 404, Local preview is unavailable, for the preview endpoint.

## Not passed or not tested

- npm audit reports 10 affected packages (six high, four moderate) in the existing vinext transitive dependency tree, including braces and fflate. These notices do not establish a proven exploitable application vulnerability. npm offers a framework downgrade; no forced downgrade was applied. Investigate compatible patched dependencies before claiming production readiness.
- Cloudflare build emitted a preferences-log EPERM warning and existing chunk/classification warnings, but exited successfully. Local Workers execution verified the compiled admin boundary.
- Native Next production build was previously blocked by Google Fonts downloads. The active Cloudflare build succeeds; native build was not repeated here.
- No configured lint script exists; no full lint pass is claimed.
- Some database RLS boundaries and invoice constraints are tested as above; authenticated administrator edits, all retailer/private-document policies, catalogue mutations and uploads remain untested.
- No admin Auth user exists: positive authenticated access and product writes remain untested.
- Guest enquiries, samples and retailer registration are not implemented end to end.
- No transactional email was sent. The advertised Resend list-domains tool returned Unknown tool.
- Catalogue reconciliation/import, verified pricing, runtime catalogue connection, quotation and invoice PDFs, ticket workflows, mobile acceptance, SEO and a full security review remain pending.
- No production or hosted preview deployment was made. Earlier local design changes still require live approval.

## Reproduction

Financial tests: node --experimental-strip-types --test tests/business-calculations.test.mjs.
TypeScript: npx tsc --noEmit --incremental false.
Cloudflare build: npm run build:vinext.
Local Worker: project-local wrangler dev --config dist/server/wrangler.json --local --port 4176.
Verify unauthenticated admin requests return 401 and private, no-store. Use isolated fixtures for future data writes after migration approval.
