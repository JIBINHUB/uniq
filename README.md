# UNIQ FLOORS

Production source for the UNIQ FLOORS Next.js website.

## Full-quality source

The complete application is stored in `uniq-source-full-quality.tgz`. The archive preserves the original images, video, fonts, components, styles, and configuration byte-for-byte without recompression.

To restore the source locally:

```bash
tar -xzf uniq-source-full-quality.tgz
npm ci
npm run dev
```

## Deployment

Vercel uses the root `package.json` bootstrap to extract the full source, install the application dependencies, and run the production Next.js build. The production domain is https://uniqfloors.vercel.app.
