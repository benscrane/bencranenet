# bencrane.net — Astro

This is the active version of the site.

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

## Analytics

The site supports [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/)
(cookieless, no consent banner required). The beacon only loads in production
builds, and only when a token is provided via the `PUBLIC_CF_BEACON_TOKEN`
environment variable.

To enable it:

1. In the Cloudflare dashboard, go to **Web Analytics** and add a site for
   `bencrane.net` (or use the existing one). Copy the **JS snippet token**.
2. In GitHub, add it as a **repository variable** named `PUBLIC_CF_BEACON_TOKEN`
   under Settings → Secrets and variables → Actions → Variables. The Build step
   in `.github/workflows/deploy.yml` passes it through to the build.

   Note that setting it in the Cloudflare Pages project settings has no effect:
   the site is built in GitHub Actions and `wrangler-action` only uploads the
   prebuilt `dist/`, so Cloudflare never runs a build of its own.

If the variable is unset, no analytics script is emitted.
