# ADR-001: A Static Astro Site on Cloudflare Pages, Built and Deployed by GitHub Actions

## Status

Accepted. Recorded on 2026-11-12 for a decision already in place. The deploy half was settled in
[#34](https://github.com/benscrane/bencranenet/issues/34).

## Context

The site is a blog, a projects list and a few pages. Nothing on it depends on who is asking or when: no accounts, no
forms that post anywhere, no data that changes between deploys. The site was on Hugo and Netlify before Astro.

The other side projects run on Cloudflare Workers with Postgres. The platform repo shares two pieces of their
deployment: a `deploy-worker` action, which runs `wrangler deploy`, polls the app's `/api/health` until it reports the
new release, and runs `wrangler rollback` if it never does, and a Postgres backup workflow. Standards §14 expects apps
to use both.

## Decision

1. **Astro with static output.** Every page is rendered at build time to `dist/`. There is no adapter and no
   server-side code.

2. **Hosted on Cloudflare Pages**, in the `bencranenet` project, so it's on the same Cloudflare account as everything
   else without running a Worker.

3. **Built in GitHub Actions, not by Pages.** `deploy.yml` builds, type-checks, format-checks and smoke-tests the site,
   then `cloudflare/wrangler-action` uploads the finished `dist/` with `wrangler pages deploy`. Pull requests run every
   step except the upload. The checks that gate a deploy are then the same ones that run on a PR, and they run in one
   place.

4. **No shared `deploy-worker` action and no backup workflow.** Everything `deploy-worker` does is a Workers
   operation, and a Pages project has no `/api/health` to poll. Pages already keeps every deployment and can roll back
   to any of them from the dashboard, so the action would add nothing. There is no database to back up.

## Consequences

- Build-time configuration has to come from GitHub (repository variables passed in by the workflow). Settings on the
  Pages project are never read, because Pages never builds.
- Rollback is a dashboard action plus a revert on `main`, not an automated health-check rollback. A broken page is
  caught before deploy by `scripts/smoke.sh`, or not at all.
- The `wrangler-action` pin is kept in step with the shared action's by hand.
- If the site ever moves to Workers static assets, switch to the shared `deploy-worker` action then. It would need a
  health route that reports the release.
- Standards sections that assume SvelteKit, Workers or Postgres don't apply, as the standards' scope table records.
