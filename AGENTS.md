# AGENTS.md

This file provides guidance to coding agents working in this repository.

Claude Code loads this file only while the repo has no `CLAUDE.md`, so don't add one. Put new guidance here.

## Project Overview

**bencrane.net** is Ben Crane's personal site: a blog, a projects list and a few standalone pages. It's a static
[Astro](https://astro.build) 5 site styled with Tailwind CSS 4, with content in Markdown and MDX. There is no server,
database or API: `npm run build` writes plain files to `dist/`, and GitHub Actions uploads them to Cloudflare **Pages**
(not Workers). See [docs/architecture.md](./docs/architecture.md).

It follows the [side-project standards](https://github.com/benscrane/platform/blob/main/docs/standards.md) shared by
every side project, but only the sections the scope table assigns a static site: package manager (§2), CI and deploy
(§14), lint and format (§15), docs (§17) and the owner gate (§18). The rest assume SvelteKit on Workers with Postgres and
don't apply.

## Documentation

| Document                                                                                    | When to read                                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [architecture.md](./docs/architecture.md)                                                   | To find where something lives, or how content becomes pages, feeds and sitemap |
| [ADRs](./docs/adr/README.md)                                                                | When you need to understand _why_ something is the way it is                   |
| [DEPLOYMENT.md](./DEPLOYMENT.md)                                                            | Before touching the deploy workflow, secrets, variables or analytics           |
| [Side-project standards](https://github.com/benscrane/platform/blob/main/docs/standards.md) | Before changing the package manager, CI, tooling or these docs                 |

## Issue Tracking

The tracker is **GitHub Issues** on `benscrane/bencranenet`. Read and file issues with `gh issue`, reference them as
`#123`, and close them from a PR body with `Closes #123`.

## Development Commands

npm for now. [#37](https://github.com/benscrane/bencranenet/issues/37) moves the repo to pnpm, and the commands below
change with it.

```bash
npm run dev               # Dev server at http://localhost:4321
npm run build             # Static build into dist/
npm run preview           # Serve dist/ locally
npm run check             # astro check: TypeScript and .astro type checking
npm run format            # Prettier, writing changes
npm run format:check      # Prettier, check only (what CI runs)
npm run smoke             # Assertions against dist/; run after build
npm run favicons          # Regenerate the favicon set in public/ (rarely needed)
```

## Quality Gate

After any change, run these in order. Steps 2–5 are what `.github/workflows/deploy.yml` runs on every pull request and
push to `main`:

```bash
npm run format            # 1. Auto-format
npm run format:check      # 2. Formatting is clean
npm run check             # 3. Type check
npm run build             # 4. Build
npm run smoke             # 5. Smoke-test the build output
```

There is no `lint` or `test` script. The site has no ESLint config and no unit tests; `scripts/smoke.sh` is the
regression suite. ESLint is a gap against standards §15.

## Code Rules

- **List and link content only through `getPublishedPosts()` and `getPublishedProjects()`** in
  `src/utils/data-utils.ts`. Calling `getCollection('blog')` or `getCollection('projects')` from a page publishes
  drafts.
- **`src/utils/content-lastmod.ts` is build-time only.** `astro.config.mjs` imports it to give the sitemap `lastmod`
  dates. Pages must not import it.
- **Name content files in slug case** (`my-post.md`, not `My Post.md`). The sitemap's `lastmod` map keys on the
  filename, so any other name silently loses its date. The smoke test catches it.
- **Keep `src/pages/404.astro`.** Without a top-level `404.html`, Pages treats the site as a single-page app and
  answers every unknown URL with the home page and a 200.
- **Prettier skips `*.astro` and `src/content/`** ([ADR-003](./docs/adr/003-prettier-skips-astro-and-content.md)).
  Format `.astro` files by hand to match their neighbours (4 spaces), and don't reflow Markdown prose.
- **Fix a build-output bug with an assertion in `scripts/smoke.sh`**, so it can't come back quietly. The script uses
  portable `grep` only (no `-P`), so it behaves the same on macOS and in CI.
- **Build-time environment variables come from GitHub**, as repository variables passed in by the Build step of
  `deploy.yml`. Setting them on the Pages project does nothing, because Cloudflare never builds the site. See
  [DEPLOYMENT.md](./DEPLOYMENT.md#configuration).
- Prettier settings today are 4 spaces, single quotes, semicolons, no trailing commas, width 140 (2 spaces for JSON,
  YAML and Markdown). #37 moves them to the standard.
- Edit files with the Edit and Write tools. Never `python3` heredocs, `sed -i` or `cat >` redirects into source.

## Writing Content

Collections and their frontmatter schemas are in `src/content.config.ts`:

- `src/content/blog/`: `title`, `publishDate`, and optionally `excerpt`, `updatedDate`, `tags`, `isFeatured`, `draft`,
  `seo`.
- `src/content/projects/`: `title`, `publishDate`, and optionally `description`, `updatedDate`, `isFeatured`, `draft`,
  `seo`.
- `src/content/pages/`: `title` and optional `seo`. Each is served at `/<filename>/`.

`draft: true` keeps an entry out of every page, listing, feed and the sitemap. `updatedDate` sets the sitemap
`lastmod`; the RSS `pubDate` stays `publishDate`. For math, write `.mdx` and use `src/components/Latex.astro` (KaTeX,
rendered at build time).
