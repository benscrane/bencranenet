# Architecture Decision Records

| ADR                                              | Decision                                                                      | Status   |
| ------------------------------------------------ | ----------------------------------------------------------------------------- | -------- |
| [001](./001-static-astro-on-cloudflare-pages.md) | A static Astro site on Cloudflare Pages, built and deployed by GitHub Actions | Accepted |
| [002](./002-cloudflare-web-analytics.md)         | Cloudflare Web Analytics, cookieless, only when a build-time token is set     | Accepted |
| [003](./003-prettier-skips-astro-and-content.md) | Prettier formats logic and config, not `.astro` templates or Markdown content | Accepted |

A new ADR takes the next number, uses the same sections (Status, Context, Decision, Consequences) and gets a row here.
A decision that replaces an earlier one says so in both files' Status.
