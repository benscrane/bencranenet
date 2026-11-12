# ADR-003: Prettier Formats Logic and Config, Not `.astro` Templates or Markdown Content

## Status

Accepted. Recorded on 2026-11-12 for a decision already in place. The exclusions are in `.prettierignore`.

## Context

CI runs `prettier --check .`, so whatever Prettier formats has to stay formatted. Two kinds of file broke when it
formatted them:

- **`.astro` templates.** `prettier-plugin-astro` re-wraps markup when a line is longer than `printWidth`, and
  re-wrapping changes the whitespace that gets rendered. It turned the footer into "Ben Crane . All rights reserved.",
  with a space before the period. `htmlWhitespaceSensitivity: "strict"` doesn't prevent it.
- **Markdown content.** Reformatting reflows line breaks the author chose, which makes prose diffs noisy.

## Decision

Prettier formats TypeScript, JavaScript, CSS, JSON, YAML and the repository's own Markdown docs. It skips `*.astro`
and everything under `src/content/`, along with build output, dependencies, `public/` and `src/assets/`.

A formatter that can quietly change the HTML the site ships is worse than no formatter. Drift in logic and config files
only costs review noise, and reformatting them can't change the output.

## Consequences

- `.astro` files are formatted by hand. Match the file's neighbours: 4 spaces.
- Standards §15 wants Prettier with the shared settings. [#37](https://github.com/benscrane/bencranenet/issues/37)
  moves to them. These exclusions don't depend on those settings, so they should carry over.
