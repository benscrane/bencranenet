# Architecture

bencrane.net is a static Astro site. Everything happens at build time: Astro reads the Markdown and MDX content,
renders every page to HTML, and writes `dist/`. Cloudflare Pages then serves those files as they are. No code runs on
a request, and the only client-side JavaScript is Astro's view transitions, the theme toggle and, when configured, the
analytics beacon.

How it gets deployed is in [DEPLOYMENT.md](../DEPLOYMENT.md). Why it's built this way is in the [ADRs](./adr/README.md).

## Source map

| Path                           | What's there                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/content/`                 | The content: `blog/`, `projects/` and `pages/`, in Markdown and MDX                                |
| `src/content.config.ts`        | The three collections and their frontmatter schemas                                                |
| `src/pages/`                   | Routes: home, paginated blog and project listings, entries, tags, standalone pages, 404, `rss.xml` |
| `src/layouts/`                 | `BaseLayout.astro`, the one page shell                                                             |
| `src/components/`              | Head and SEO tags (`BaseHead.astro`), navigation, previews, pagination, theme toggle, `Latex`      |
| `src/data/site-config.ts`      | Site title, URL, hero copy, nav and social links, page sizes                                       |
| `src/utils/data-utils.ts`      | `getPublishedPosts()`, `getPublishedProjects()`, tag helpers                                       |
| `src/utils/content-lastmod.ts` | Build-time `lastmod` dates for the sitemap                                                         |
| `src/styles/global.css`        | Tailwind, theme colours and fonts                                                                  |
| `public/`                      | Copied to `dist/` as is: favicons, `og-image.png`, `robots.txt`, `site.webmanifest`                |
| `scripts/smoke.sh`             | Assertions against the built `dist/`                                                               |
| `scripts/make-favicons.mjs`    | Generates the favicon set in `public/`                                                             |
| `astro.config.mjs`             | Integrations (MDX, sitemap) and the Tailwind Vite plugin                                           |

## From content to pages

```text
src/content/{blog,projects,pages}/*.md(x)
   │  glob loaders + zod schemas (content.config.ts)
   ▼
getCollection()  ──►  getPublishedPosts() / getPublishedProjects()   (drop draft: true)
   │                     │
   │                     ├─► /blog/[...page]  /projects/[...page]   paginated listings
   │                     ├─► /blog/[id]  /projects/[id]             one page per entry
   │                     ├─► /tags, /tags/[id]/[...page]            blog posts by tag
   │                     ├─► /rss.xml                               blog feed
   │                     └─► / (home)                               featured posts and projects
   └─► /[...id]                                                     standalone pages (e.g. /contact/)
```

**Drafts.** An entry with `draft: true` is still loaded, but `getPublishedPosts()` and `getPublishedProjects()` filter it
out, and every page that lists or links entries goes through them. So a draft gets no page, no listing entry, no feed
item and no sitemap URL. A page calling `getCollection()` directly would publish drafts; `scripts/smoke.sh` checks
that the current drafts aren't in the build output.

**Sitemap.** `@astrojs/sitemap` lists every page actually built, which is why 404 and `rss.xml` aren't in it without a
filter. It also adds `lastmod`, which comes from `src/utils/content-lastmod.ts`. `astro.config.mjs` is evaluated before
the content layer exists, so that module reads the Markdown frontmatter itself and maps each URL to its `updatedDate`
or `publishDate`. A listing page gets the date of its newest entry. The map keys on filenames, so a file whose name
isn't already slug case loses its `lastmod`; the smoke test fails if any blog or project URL lacks one.

**Feed.** `/rss.xml` lists published blog posts. Each item's `pubDate` is the original `publishDate`, even if the post
was updated.

## Presentation

- **Layout.** Every page uses `BaseLayout.astro`, which renders `BaseHead.astro` (title, description, canonical URL,
  Open Graph and Twitter cards, icons, font preloads) and Astro's `ClientRouter` for view transitions.
- **Theme.** Dark mode is a `dark` class on `<html>`, stored as `theme` in `localStorage`. An inline script in
  `BaseLayout.astro` applies a stored dark theme before first paint. `ThemeToggle.astro` falls back to the OS
  preference and handles the toggle.
- **Fonts.** Inter and Newsreader, self-hosted from the `@fontsource-variable/*` packages and bundled by Vite. No font
  CDN.
- **Math.** `src/components/Latex.astro` renders KaTeX to HTML at build time. Only `.mdx` content can use it.
- **Analytics.** `BaseHead.astro` adds the Cloudflare Web Analytics beacon only in a production build with
  `PUBLIC_CF_BEACON_TOKEN` set ([ADR-002](./adr/002-cloudflare-web-analytics.md)).

## Checks

There are no unit tests. `npm run check` type-checks TypeScript and `.astro` files, and `npm run smoke` runs
`scripts/smoke.sh` against `dist/`. It's a list of assertions about the specific ways the site has broken before:
canonical URLs and Open Graph tags, `404.html`, sitemap URLs and `lastmod`, the feed, KaTeX assets, drafts staying
unpublished, and leftover template text.
