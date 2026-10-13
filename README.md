# UNIQ FLOORS

UNIQ FLOORS is a Next.js App Router storefront. The application source, assets,
and npm lockfile live directly in this repository.

## Local development

```sh
npm ci
npm run dev
```

The original Next.js development server runs at <http://localhost:4175>.
To test the Cloudflare runtime locally:

```sh
npm run build:vinext
npm run start:vinext
```

The vinext Vite development server is available with `npm run dev:vinext`
on port 4176.

## Cloudflare Workers

The Worker configuration in `wrangler.jsonc` is pinned to the
`flooruniq@gmail.com` Cloudflare account and the `uniq-floors` Worker. It uses
Workers Static Assets for the files in `public/` and has logs and traces enabled.

```sh
npm ci
npm run build:vinext
./node_modules/.bin/wrangler deploy --dry-run --config dist/server/wrangler.json
npm run deploy:vinext
```

Check `wrangler whoami` before a remote deployment. Wrangler's login is
separate from the Cloudflare plugin connection. The deployed site is
<https://uniq-floors.flooruniq.workers.dev>. The temporary test domain
<https://leafcreationism.online> (including `www`) is configured as a Worker
custom domain. Hostinger delegates its nameservers to Cloudflare. Replace these
routes when the client provides the final domain.
For this checkout, the named Wrangler profile `flooruniq` is active; verify
it shows `flooruniq@gmail.com` before redeploying.

The original Vercel source archive remains available in Git history for
rollback. There are currently no server-side environment variables or
Supabase dependencies in this application.
