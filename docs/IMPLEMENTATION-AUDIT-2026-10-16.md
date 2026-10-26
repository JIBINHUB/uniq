# UNIQ FLOORS implementation audit — 16 October 2026

## Live architecture

- Next.js 16 and React 19 run through Vinext on the `uniq-floors` Cloudflare Worker. Supabase project `isahlfzmswkeiitoiwbe` stores the owner catalogue, content, retailer applications and trade quotation requests.
- The public Home, Shop, Carpets and related pages render the bundled catalogue immediately, then fetch published Supabase updates in the background. This avoids holding navigation on database reads. New product and flooring detail slugs can resolve from Supabase on direct visits. The read-only catalogue endpoint is `/api/storefront-data`.
- The owner dashboard at `/admin` uses the requested four-digit PIN `8888`. Cloudflare stores only its salted hash, a separate session-signing secret and the Supabase secret key as encrypted Worker secrets. Sessions are server-side revocable and expire after two hours; PIN attempts are throttled in Supabase.
- Guests can browse the separate retailer shop and indicative volume prices. Approved retailers can save quotation requests. The owner Documents panel can review requests. The server recalculates prices and rejects unapproved accounts; opening WhatsApp does not confirm a message was sent or an order placed.

## Database and security

- The owner and trade quote migrations were applied to the live Supabase project after explicit approval. The later `restrict_owner_rpc_anon` migration revoked anonymous execution on three staff-only functions.
- Effective privilege checks confirm `anon` cannot execute `claim_staff_access`, `owner_content`, `review_retailer` or the PIN session functions. All public tables have RLS enabled. Two private PIN tables intentionally have no policies because only service-role functions use them.
- Supabase still reports three signed-in callable security-definer functions. Their internal guards require verified staff invitation, owner role, or owner permission respectively. Their authenticated grants are intentional for those workflows. See the [Supabase security linter guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- The 12 seeded product prices remain unverified in Supabase until the owner confirms each selling price and VAT rate. The storefront uses the existing displayed prices for those records; owner-saved prices become verified and replace them. The quote API fails closed if its live catalogue read fails.

## Design and performance

- The featured flooring gallery now shows complete planks on desktop and a large, complete active plank on mobile. The selected floor links directly to its detail page.
- The public, retailer and owner surfaces use the current UNIQ white, dark green and DM Sans styling. The loading screen uses a faded green background. Home story, Shop, Carpets and retailer screens are responsive.
- A forced `cache: 'force-cache'` wrapper made all Supabase calls from the Worker take about seven seconds and triggered Cloudflare resource-limit 503s when public pages were dynamic. Removing it brought the catalogue endpoint down to roughly 0.9–2.3 seconds in spot checks. Public pages remain fast because this fetch does not block their first render.
- The shared CSS bundle is still about 679 KB before compression, and the hero video is large. No Core Web Vitals result has been measured on real devices.

## Verification and deployment

- `npm test`: 28/28 passed, including owner PIN/session, catalogue RLS, retailer isolation, price arithmetic and trade quote database checks. `npx tsc --noEmit`, `git diff --check` and the Vinext production build passed.
- Live owner PIN login opened the connected dashboard; the Products editor listed 12 records, the Website studio saved the unchanged hero draft successfully, and the trade request panel loaded an empty result successfully. The Worker secret list confirms all three required secrets are installed.
- Final read-only production checks returned 200 for `/`, `/shop`, `/carpets`, a product detail, `/retailers/shop`, `/admin` and `/api/storefront-data`. Unauthenticated `/api/retailer/quotes` returned the expected 403. One production spot check measured 0.50 seconds for Shop, 0.66 for Carpets, 0.24 for retailer shop and 0.89 for the catalogue endpoint; these are single-request observations, not reliability or Core Web Vitals measurements.
- The deployed Worker version is `89cdf224-8d58-4caa-874c-38a7620dfea9` at [leafcreationism.online](https://www.leafcreationism.online/).

## Remaining validation

- No real approved retailer account exists yet, so production registration, email verification, approval, quote submission and status review were not exercised end to end. Database isolation and quote calculation passed local tests.
- No published product or hero content was changed merely for testing. Owner read/edit forms and draft saving worked; an actual publish-and-revert cycle remains untested in production.
- The public pages show their bundled catalogue first and replace it with the published Supabase data after the background request. A freshly changed product may briefly show its prior state, and existing CDN/browser caching can delay updates by up to roughly 30 seconds.
