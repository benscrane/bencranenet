# bencrane.net - Deployment Guide

## Overview

bencrane.net is a static site on Cloudflare Pages, served from the `bencranenet` Pages project at
`https://bencrane.net`. GitHub Actions builds it and uploads the result. Cloudflare never runs a build of its own, and
nothing deploys from the Cloudflare dashboard. There is no server-side code and no database. Why this setup, and why it
doesn't use the platform's shared `deploy-worker` action:
[ADR-001](./docs/adr/001-static-astro-on-cloudflare-pages.md).

---

## How Deploys Work

`.github/workflows/deploy.yml` runs one job, `deploy`, on every pull request to `main`, every push to `main`, and by
hand from the Actions tab (`workflow_dispatch`):

1. `npm ci`
2. `npm run check`
3. `npm run format:check`
4. `npm run build`, with `PUBLIC_CF_BEACON_TOKEN` from the repository variables, writing `dist/`
5. `npm run smoke`, assertions against `dist/` (`scripts/smoke.sh`)
6. **Push and manual runs only:** `cloudflare/wrangler-action` runs
   `pages deploy dist --project-name=bencranenet --commit-dirty=true`

Pull requests stop after step 5, so they build and are checked but never published. Runs are grouped by workflow and
ref, and a newer run on the same ref cancels the older one. If any step fails, nothing is uploaded and the previous
deployment keeps serving.

Every action is pinned to a commit SHA with its tag as a comment. Dependabot's `github-actions` entry keeps the pins
current. Keep the `wrangler-action` pin in step with the one in the platform's shared `deploy-worker` action.

---

## Configuration

The only configuration is build-time. Astro inlines `PUBLIC_*` variables into the HTML when it builds, and the build
happens in GitHub Actions, so values live in GitHub, not in the Pages project's settings. Setting one on the Pages
project has no effect.

| Variable                 | Kind                        | Purpose                                                                                                     |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PUBLIC_CF_BEACON_TOKEN` | Repository variable, `vars` | Cloudflare Web Analytics token. The beacon loads only in production builds with this set. **Not set today** |

### Turning on analytics

The site supports [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/), which is cookieless and
needs no consent banner ([ADR-002](./docs/adr/002-cloudflare-web-analytics.md)).

1. In the Cloudflare dashboard → **Web Analytics**, add a site for `bencrane.net` (or use the existing one) and copy
   the **JS snippet token**.
2. In GitHub → Settings → Secrets and variables → Actions → **Variables**, add a repository variable named
   `PUBLIC_CF_BEACON_TOKEN`. It's a variable, not a secret: the token ships in every page's HTML anyway.
3. Re-run the workflow on `main`. The built `index.html` now loads `static.cloudflareinsights.com/beacon.min.js`.

If the variable is unset, no analytics script is emitted.

---

## Secrets

Every secret this repository holds, as of 2026-11-12. They are repository secrets, and there are no environments.

| Secret                  | Where it lives    | Purpose                                                                                   |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Repository secret | Cloudflare API token that can deploy to the `bencranenet` Pages project (Pages: Edit)     |
| `CLOUDFLARE_ACCOUNT_ID` | Repository secret | The Cloudflare account that holds the Pages project. An identifier, not a credential      |
| `NETLIFY_AUTH_TOKEN`    | Repository secret | **Unused.** Left over from when the site deployed to Netlify. Nothing reads it; delete it |

Standards §14 asks for credentials to be environment secrets limited to `main`, because any workflow on any branch can
read a repository secret. Moving `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` into a `production` environment,
and naming it on the deploy job, closes that gap.

### Rotating a secret

Rotate on a schedule you choose and at once if one may have leaked. Afterwards, confirm the workflow run went green and
`https://bencrane.net` serves the latest commit.

| Secret                  | How to rotate                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | In Cloudflare → My Profile → API Tokens, create a token with the same scope. Update the secret, run the workflow on `main` by hand to prove it deploys, then revoke the old one |
| `CLOUDFLARE_ACCOUNT_ID` | Nothing to rotate. It changes only if the Pages project moves to another account                                                                                                |
| `NETLIFY_AUTH_TOKEN`    | Don't rotate it. Delete the secret, and revoke the token in Netlify if the account still exists                                                                                 |

---

## Rolling Back

Pages keeps every deployment, so a rollback is instant and needs no rebuild:

1. Cloudflare dashboard → **Workers & Pages** → `bencranenet` → **Deployments**.
2. On the last good production deployment, open the menu and choose **Rollback to this deployment**.

That only changes what's served. The next push to `main` deploys again, so revert or fix the bad commit on `main` as
well. Reverting alone also works: the workflow rebuilds and redeploys the reverted tree in a minute or two.

There is no database, so there are no migrations, and no case where a rollback has to undo one.
