# UNIQ FLOORS business platform

## Verified environment

- Existing site: https://leafcreationism.online/ and www; preserve both domains.
- Existing Worker: uniq-floors, account 85c8ed649a0d046be18765c5ac7f3488.
- Cloudflare architecture: vinext 1.1.0, Vite 8.3.4, Workers Static Assets, nodejs_compat. Latest live version inspected: 22e6f752-db00-4f76-b83e-5bf54803019c, deployed through Wrangler. No Git build integration was established by this inspection.
- Supabase: isahlfzmswkeiitoiwbe, flooruniq@gmail.com's Project, London eu-west-2, Postgres 17; authenticated read access verified. Before implementation it contained zero public tables, auth users and storage buckets.
- Resend tools are advertised, but the list-domains call returned Unknown tool. Email connection is unverified and unusable in this execution environment.

## Audit classification

| Area | Existing status | Required work |
| --- | --- | --- |
| Home, categories, shop, product pages | Visual frontend implemented | Load approved Supabase catalogue while preserving routes and images |
| Product search and filters | Local catalogue filters | Add collections/material/thickness/finish and database queries |
| Calculator | Partial; fixed 2.2 m² for every product; binary float rounding | Use verified coverage, integer decimal arithmetic and verified prices |
| Basket and samples | Browser localStorage selection; request button has no submit handler | Persist validated guest submissions with duplicate prevention |
| Live Room | Existing public visualizer | Preserve; acceptance test mobile and selections |
| Retailer registration/account | Missing | Application, approval, isolated account access |
| Admin | Missing originally; local protected login and overview/product-edit shell now added | Create approved admin identity; activate migration; complete management workflows |
| Bulk enquiry | Direct WhatsApp links only | Save before handoff; settings-controlled approved number |
| Individual enquiry/email | Missing | Save, queue notifications, retry email independently |
| Quotations/invoices | Missing | Draft lifecycle, secure PDF, email and issuance validation |
| Support | Missing | Verified guest access and authenticated retailer history |
| Product data | Hardcoded, no documented source approvals | Reconcile existing entries against client-approved inventory |
| Reviews | Hardcoded ratings, fabricated percentages and named testimonial | Remove unsupported claims; render only approved genuine evidence |
| Warranty and commerce wording | Fixed service warranty disagrees with product warranties; secure payment/checkout claims | Replace with verified warranty and enquiry language |
| SEO/privacy | Shared metadata, product fallback to first item, privacy link points home | Unique metadata/404s, approved privacy notice, factual structured data |

## Reference comparison

Invictus public homepage lists carpet and luxury vinyl flooring and provides MyInvictus login. The existing catalogue includes engineered wood, laminate, solid wood, parquet and SPC entries; these must not be silently renamed into Invictus products. The retailer confirmation URL and LVT detail route could not be retrieved during this audit. No exact selling prices, SKU mapping, authorized imagery or price/VAT approval was verified. Keep existing catalogue records for reconciliation; do not seed existing prices as verified.

Reference: https://invictus.co.uk/

## Prepared local work

The versioned business_platform_foundation migration prepares 24 application tables, default-deny RLS, admin authorization from a database-owned role table, public published catalogue reads, owner-isolated private records, integer pence pricing, timestamp triggers and invoice immutability. Company settings contain only the known UNIQ FLOORS name. No fabricated VAT/bank/contact details are seeded. Guest writes are intentionally not exposed directly through anonymous table grants; they require a validated server endpoint with spam protection and a privileged server credential.

The user explicitly approved the backend migration, which is now applied to the existing Supabase project. All 24 tables have RLS enabled. Rollback-contained tests verified anonymous denial of customer reads, non-admin denial of settings writes, two-owner customer isolation, and issued invoice/line immutability. Test users and records were rolled back. These tests do not certify every future business workflow.

Local code includes Supabase browser/server clients, verified getUser authentication, database-role authorization, no-store private API responses, an admin login/real-statistics/product-name-and-status editing shell and decimal-safe business calculations. The existing product calculator now uses integer decimal pack arithmetic and pence-based totals, with bounded finite area input. Its existing 2.2 m² coverage and catalogue prices still need business verification and database replacement. The login does not grant admin access from client metadata. No admin user has been created. Existing storefront is not connected to these tables yet.

## Execution stages and acceptance gates

1. Approve and apply the additive schema; test public/private/admin/retailer RLS and invoice mutation rules with rollback-contained fixtures. Add missing relational constraints discovered by tests before importing data.
2. Create the client-designated admin identity using normal Auth, then assign admin role only through trusted administration. Verify positive and negative access tests.
3. Import existing catalogue as drafts without overwriting images or slugs. Add approved price unit, VAT, pack coverage, availability and documentary sources. Connect public product routes, filters and variants.
4. Implement enquiry/sample/application persistence transactions, idempotency, cross-origin protections, shared rate limiting and bot checks. Preserve guest browsing and Live Room. Replace checkout wording when the enquiry flow is functional.
5. Connect retailer approval, dashboard management and settings. Confirm ownership isolation using two separate retailer accounts.
6. Build quotation/invoice editor with integer-pence calculations, runtime-compatible PDFs, private storage and immutable issued documents. Configure actual company/payment details.
7. Implement support verification, message history and notification queue. Connect Resend using an approved verified sender; record attempts and retry safely.
8. Remove fabricated reviews and warranty claims, fix privacy/metadata/404s, test mobile/SEO/runtime, then prepare client handover and production approval.

## External inputs required

- Foundation migration approval is complete; future destructive changes still require specific approval.
- Designated admin email; do not assume a plugin owner's login is the business administrator.
- Approved catalogue/Invictus SKU mapping, authorized retailer status, pack coverage, prices, price units, VAT and availability.
- Working Resend connection and approved sender/business notification addresses; no sender success is claimed.
- Server-only Supabase credential in the local runtime/Worker secret store for validated guest operations. Plugin management access is not automatically a runtime credential.
- Confirmed business address, phone/WhatsApp, privacy contact, VAT and bank/payment information as applicable.

## Deployment/handover

No Cloudflare deployment, DNS or domain changes were made. Earlier product-design edits remain local pending the user's live deployment approval. Never deploy an incomplete backend by presenting it as operational.

Use npm run build:vinext for the active Workers build. Verify Wrangler account before any authorized deployment. Store privileged keys only in ignored local environment files and Worker secrets. .env.example contains names and the known project URL only.

Admin access requires an Auth account plus an explicit user_roles admin row. Self-registration never assigns administrator or approved-retailer privileges. Admin APIs reject unauthenticated requests, and every query still passes through Supabase RLS. Incomplete catalogue setup returns an error rather than fake statistics. The overview does not yet replace every required operational dashboard section.

Testing notes are tracked in VERIFICATION.md; schema, email delivery, retailer lifecycle, guest writes, PDFs and authenticated admin writes cannot be certified until their acceptance gates are met.
