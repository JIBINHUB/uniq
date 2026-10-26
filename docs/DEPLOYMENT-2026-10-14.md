# Production deployment — 14 October 2026

- Worker: `uniq-floors`
- Account: `85c8ed649a0d046be18765c5ac7f3488` (`flooruniq@gmail.com`)
- Version: `22d7a70a-652a-4fde-aa62-f62908f9c663`
- Domains: `leafcreationism.online` and `www.leafcreationism.online`
- Built with `npm run build:vinext`, packaged with Wrangler dry run, deployed using the `flooruniq` profile.
- Runtime public Supabase URL and publishable key were added to the generated deployment configuration. No owner preview PIN, preview signing secret, or privileged Supabase key was uploaded.

## Subsequent deployments

The source Wrangler config does not contain the runtime public Supabase variables. Rebuilding regenerates the deployment config. Preserve these remote variables with Wrangler's `--keep-vars` on subsequent deployments, or explicitly supply the two public Supabase variables in the generated deployment configuration before uploading. Never upload local owner preview credentials.

## Live checks

- Home, Brighton product, retailer registration and admin login: HTTP 200.
- `/rooms`: HTTP 307 redirect to `/retailers`.
- `/api/admin/overview`: HTTP 401 without authentication.
- `/api/retailer-applications`: HTTP 401 without verified authentication.
- `/api/owner-preview`: HTTP 404; local preview unavailable.
- `/retailers?testing=1` displays the production registration form, without a preview authentication bypass.

Actual retailer email confirmation and authenticated owner operations remain subject to the implementation limitations recorded in `VERIFICATION.md` and `RETAILER-IMPLEMENTATION.md`.
