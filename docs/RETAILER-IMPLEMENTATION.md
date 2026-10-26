# UNIQ FLOORS retailer experience

The user clarified that UNIQ FLOORS is an independent flooring company without permission to use Invictus catalogue assets. Invictus is a functional reference only. No Invictus product records, photographs or warranty terms were imported. The user asked to retain the current UNIQ FLOORS catalogue while preparing approved company product information.

## Implemented

- `/retailers`: original UNIQ FLOORS registration page based on the reference account/application/approval flow.
- Email/password account creation through Supabase Auth. When email confirmation is required, the page explicitly states that the business application is not saved yet; the applicant must verify and sign in before submission.
- Business details, optional VAT number, UK postcode validation and application-processing consent.
- `/api/retailer-applications`: server-verified user and email, origin validation, bounded fields, user-owned pending submission and idempotency key. Repeated submissions return an existing application.
- A saved-application confirmation screen; no success claim before persistence.
- Narrow authenticated INSERT RLS policy: the applicant can submit only under their own identity/email with pending status and no reviewer identity.
- Main navigation now says Retailers. The previous `/rooms` route redirects to `/retailers`. Existing visualizer retained at `/live-room`; other visualizer links updated accordingly.

## Verified

TypeScript and source checks passed. Cloudflare production build includes all new routes. Local `/rooms` returns a 307 redirect to `/retailers`; `/live-room` returns 200. Unauthenticated application POST returns 401 with private, no-store caching.

A rollback-contained database fixture successfully saved a user-owned pending application. The applicant could not approve their own application. The fixture Auth user and application were rolled back.

Desktop and 390px mobile pages rendered without horizontal overflow. Screenshots: `/private/tmp/uniq-retailer-desktop.png` and `/private/tmp/uniq-retailer-mobile.png`.

## Pending

## Local design testing update

The retailer page now uses the existing product-page dark oak imagery, Metropolis type, forest panels, green pill buttons and branded navigation. In Next development mode, `/retailers` opens an account-free visual workspace preview by default. Become a retailer opens the actual registration form; the form can return to the preview. Preview panels contain no private records, do not simulate saved requests, and do not bypass the application API. Production retains the verified-account registration flow.

Actual email delivery, real-account sign-up-to-confirmation acceptance, owner approval UI, approved retailer dashboard and notification delivery are not certified complete. No registration was submitted to Invictus. No Cloudflare deployment or domain changes were made.

Reference inspected: https://invictus.co.uk/myinvictus/register and https://invictus.co.uk/myinvictus/register/confirmation-retailer .
