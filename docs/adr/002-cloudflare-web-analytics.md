# ADR-002: Cloudflare Web Analytics, Cookieless, Only When a Build-Time Token Is Set

## Status

Accepted. Recorded on 2026-11-12 for a decision already in place.

## Context

It's useful to know roughly which posts get read. It isn't worth a cookie banner, a third-party tracker or anything
that follows a reader from one site to another. The site is already on Cloudflare.

## Decision

1. **Cloudflare Web Analytics**, which sets no cookies and so needs no consent banner.

2. **The beacon is added only in a production build with a token.** `BaseHead.astro` emits the
   `static.cloudflareinsights.com/beacon.min.js` script only when `import.meta.env.PROD` is true and
   `PUBLIC_CF_BEACON_TOKEN` is set. Local development and builds without the token send nothing.

3. **The token is a GitHub repository variable**, passed into the Build step of `deploy.yml`. It's a variable rather
   than a secret because it ends up in every page's HTML. It can't go on the Pages project, because Pages never builds
   the site ([ADR-001](./001-static-astro-on-cloudflare-pages.md)).

## Consequences

- Analytics are off until someone sets the variable. Turning them on is in [DEPLOYMENT.md](../../DEPLOYMENT.md).
- Readers with a content blocker that blocks `cloudflareinsights.com` aren't counted. That's accepted.
- Changing the token needs a rebuild, since it's inlined into the HTML.
