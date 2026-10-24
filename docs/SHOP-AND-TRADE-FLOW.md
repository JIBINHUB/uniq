# Customer shop and retailer catalogue

## Local changes — 14 October 2026

- `/shop`: public customer browsing, with a clear link to the separate retailer area.
- Product ordering and the basket prepare a WhatsApp message to the existing UNIQ FLOORS team number, including selected products, colours and quantities. The customer reviews and sends it in WhatsApp. No message is sent automatically, no online payment is collected, and no confirmed order is fabricated.
- `/retailers`: dedicated email/password sign-in page in the website's charcoal, forest-green and Metropolis theme.
- `/retailers/register`: existing verified-email retailer application form.
- `/retailers/catalogue`: server-verified Supabase user, trusted `retailer` role and approved retailer profile required. Suspended profiles, customer roles and missing profiles fail closed.
- Trade filters cover material, colour and product search. Trade selections prepare a separate WhatsApp enquiry including the approved business name. Trade prices are confirmed by the team.
- `/auth/callback`: PKCE verification code exchange and fixed internal redirect; user-supplied redirect destinations are ignored. Supabase redirect allowlist and actual email delivery still need confirmation.
- `/retailers/design-preview`: local development and localhost only. Existing public catalogue design preview; no private data or account access. Production returns 404.

## Evidence

- TypeScript check and five calculation/access/message tests pass.
- Cloudflare production build passes.
- At 1280px desktop and 390px mobile, trade and sign-in screens have no horizontal overflow. Selected images loaded.
- Browser selection of two Brooklyn packs and one Camden pack produced the correct trade WhatsApp message.
- Customer product and basket generated a Brighton White Oak message with ten packs; no WhatsApp message was sent.
- Next development and the production Worker running locally both redirect unauthenticated `/retailers/catalogue` requests to `/retailers`, including `?testing=1`.
- Production local Worker returns 404 for `/retailers/design-preview`.
- Rollback-contained Supabase fixture confirms approved role/profile lookup works and a retailer reads only its own role/profile. Fixture users and records were rolled back.

Actual verified-user sign-in through the approved catalogue has not been tested with a real retailer account. Retailer approval and role assignment currently require trusted administration; there is no finished owner approval UI.

## Catalogue clarification and original imagery

The user initially selected retaining the company's own catalogue, then clarified that UNIQ FLOORS also stocks the reference-site products. Public manufacturer search returned 65 LVT product ranges and 15 carpet ranges, with colour variants and product references. UNIQ FLOORS currently has 12 existing floors and no carpet records.

Automatic approval review rejected the initial bulk asset import because the user previously explicitly said the business has no permission to reuse Invictus assets. The user then requested original generated material images and factual product information. The blocked importer was removed. The safer factual collection was approved and executed; no supplier photographs, marketing text, PDFs or warranty documents were copied into the website.

Added 65 LVT ranges and 15 carpet ranges, covering 366 colour variants, alongside the existing 12 UNIQ FLOORS products. Each variant retains a source URL and the factual attributes in its manufacturer's structured product data. No supplier prices are treated as UNIQ FLOORS selling prices. The collection is stored locally in `lib/catalogue/invictus-facts.json`, not yet imported into the Supabase catalogue tables.

Six original AI material studies were created: natural wood, smoked wood, parquet, stone, beige carpet and grey carpet. These are shared illustrations, not 366 exact product photographs. They are labelled as illustrations, and customers are directed to genuine samples to check colour, grain and texture. WebP assets total about 1.2 MB; generated originals remain preserved.

Product-specific manufacturer warranty durations are displayed where the product page lists them. LVT residential durations vary across the imported ranges (20, 25 or 40 years). Sirius and Canopus product pages explicitly display 20-year stain and wear warranty badges. Other carpet product pages did not list these badges, so a uniform 20-year promise was not invented. The LVT waterproof description is attributed to the manufacturer and does not imply a waterproof installation; no carpet waterproof claim is made.

`/flooring/[slug]` provides public product detail, colour choice, area input, carpet width choice, factual specifications, sample enquiry and WhatsApp ordering. `/retailers/flooring/[slug]` checks trusted retailer access before rendering the trade version. Customer and trade manufacturer selections are separate in browser storage. Both prepare messages that the visitor reviews and sends; no confirmed order is created automatically.

The fact collector is `scripts/collect-invictus-facts.mjs`. It discovers the manufacturer's public catalogue search configuration and paginates the read-only public search endpoint. Run with `--refresh` to bypass local caches when checking updated facts.

Additional evidence: all 80 ranges and 366 variant IDs have been checked, source records were collected without failures, and seven tests pass. A browser-selected Sirius Silver Chalice enquiry preserved 32.5 m² and the preferred 4 m carpet width both on the product page and in the catalogue selection. No WhatsApp message was sent.

The final Cloudflare build was served locally at port 4182. Public shop, Sirius carpet detail and Ultimus vinyl detail returned 200, including their respective listed warranty durations. Unauthenticated trade catalogue and trade product detail returned 307 to retailer sign-in. The local-only design preview returned 404 in the production runtime. Generated WebP assets returned 200. At 390px the new carpet product page and expanded collection had no horizontal overflow. The temporary manufacturer selection used for browser verification was removed through the UI.

Sources inspected: https://invictus.co.uk/lvt/products/product-search , https://invictus.co.uk/carpet/product-search , and the public retailer registration/confirmation reference.

These new changes are local only; the last live version remains `22d7a70a-652a-4fde-aa62-f62908f9c663` until a further deployment is approved.
