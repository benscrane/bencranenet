# bencrane.net — Astro

This is the active version of the site. The `hugo/` directory at the repo root is a previous iteration and is no longer used.

## Tech stack

- [Astro](https://astro.build) — static site framework
- [Tailwind CSS](https://tailwindcss.com) — styling
- MDX — content authoring

## Local development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:4321`.

## Deployment

The site is deployed to [Cloudflare Pages](https://pages.cloudflare.com) automatically on every push to `main` via the GitHub Actions workflow at `.github/workflows/deploy.yml`.

The workflow:
1. Installs dependencies (`npm ci`)
2. Builds the site (`npm run build`), outputting static files to `dist/`
3. Deploys `dist/` to the `bencranenet` Cloudflare Pages project using `cloudflare/wrangler-action`

No manual deployment steps are required.
