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

## Docs

- [AGENTS.md](./AGENTS.md) — commands, the quality gate, code rules and how to write content
- [docs/architecture.md](./docs/architecture.md) — how the site is put together
- [docs/adr/](./docs/adr/README.md) — why it's built this way
- [DEPLOYMENT.md](./DEPLOYMENT.md) — deploys, secrets, analytics and rollback

Every push to `main` builds the site in GitHub Actions and deploys it to Cloudflare Pages. No manual steps are needed.
