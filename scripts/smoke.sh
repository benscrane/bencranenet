#!/usr/bin/env bash
#
# Assertions against the built site. Not a test framework — a tripwire for the
# specific ways this site has broken before. Run after `npm run build`.
#
# Portable grep only (no -P, no GNU-isms) so behaviour matches between macOS
# and ubuntu-latest in CI.

set -euo pipefail

DIST=${1:-dist}
fails=0

pass() { printf '  ok    %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; fails=$((fails + 1)); }

exists() {
    if [ -f "$DIST/$1" ]; then pass "$1 exists"; else fail "$1 is missing"; fi
}

contains() {
    if [ -f "$DIST/$1" ] && grep -qF "$2" "$DIST/$1"; then
        pass "$1 contains '$2'"
    else
        fail "$1 does not contain '$2'"
    fi
}

omits() {
    if [ ! -f "$DIST/$1" ]; then
        fail "$1 is missing, cannot check that it omits '$2'"
    elif grep -qF "$2" "$DIST/$1"; then
        fail "$1 contains '$2' but should not"
    else
        pass "$1 omits '$2'"
    fi
}

missing() {
    if [ -e "$DIST/$1" ]; then fail "$1 was built but should not exist"; else pass "$1 not built"; fi
}

absent_everywhere() {
    if grep -rqF "$1" "$DIST"; then
        fail "'$1' still appears in the build output"
    else
        pass "'$1' absent from output"
    fi
}

echo "Smoke-testing $DIST"

echo "- routes"
for page in \
    index.html \
    404.html \
    robots.txt \
    rss.xml \
    sitemap-index.xml \
    sitemap-0.xml \
    favicon.svg \
    favicon.ico \
    favicon-96.png \
    apple-touch-icon.png \
    site.webmanifest \
    blog/index.html \
    blog/js-dice/index.html \
    projects/index.html \
    projects/animals-and-amplifiers/index.html \
    contact/index.html \
    tags/index.html; do
    exists "$page"
done

# 404.html is load-bearing beyond being a nice page: without a top-level
# 404.html, Cloudflare Pages treats the deployment as a single-page app and
# serves index.html with HTTP 200 for every unmatched path. Deleting
# src/pages/404.astro would silently reintroduce site-wide soft-404s.

echo "- metadata"
contains index.html 'rel="canonical" href="https://bencrane.net/"'
# An absolute og:image URL plus explicit dimensions is what most scrapers
# need to render a card at all; a relative path is the usual reason one
# silently does not appear.
contains index.html 'property="og:image" content="https://bencrane.net/og-image.png"'
contains index.html 'property="og:image:width" content="1200"'
contains index.html 'property="og:image:height" content="630"'
contains index.html 'property="twitter:card" content="summary_large_image"'
contains blog/js-dice/index.html 'rel="canonical" href="https://bencrane.net/blog/js-dice/"'
contains robots.txt 'Sitemap: https://bencrane.net/sitemap-index.xml'

# The sitemap is the only place a crawler learns a page changed. @astrojs/sitemap
# derives the URL list from real build output; astro.config's serialize() attaches
# lastmod from frontmatter via src/utils/content-lastmod.ts. That module maps URLs by
# filename, so a renamed or non-slug-cased content file silently loses its lastmod --
# the blanket check at the end of this section is what catches it.
#
# sitemap-0.xml is written as a single line with no whitespace between tags, so a URL
# and its lastmod can be asserted as one fixed string. The `sitemap` package re-parses
# and normalises the date we supply, so YYYY-MM-DD comes back as a full ISO instant --
# match the date prefix, not a closing </lastmod>.
echo "- sitemap"
contains sitemap-index.xml '<loc>https://bencrane.net/sitemap-0.xml</loc>'
contains sitemap-0.xml '<loc>https://bencrane.net/contact/</loc>'
contains sitemap-0.xml '<loc>https://bencrane.net/tags/javascript/</loc>'
contains sitemap-0.xml '<loc>https://bencrane.net/blog/js-dice/</loc><lastmod>2019-10-06'
contains sitemap-0.xml '<loc>https://bencrane.net/projects/animals-and-amplifiers/</loc><lastmod>2024-01-02'
# Listing pages are as fresh as the newest thing they list.
contains sitemap-0.xml '<loc>https://bencrane.net/blog/</loc><lastmod>2019-10-06'

# 404 and non-HTML endpoints are excluded by the integration, not by a `filter`.
# Asserting it means a future `filter` cannot quietly start publishing them.
omits sitemap-0.xml 'https://bencrane.net/404'
omits sitemap-0.xml 'rss.xml'

# Drafts generate no page, so they cannot reach the sitemap -- unless a listing page
# starts calling getCollection() directly.
omits sitemap-0.xml 'ynab-dashboard'
omits sitemap-0.xml 'one-database-per-tenant'

# Every /blog/<slug>/ and /projects/<slug>/ entry must carry a lastmod. Unlike the
# assertions above this keeps working as posts are added: split the single-line XML on
# </url>, then look for a <loc> that closes its <url> with no <lastmod> in between.
# ERE (-E) rather than GNU \| so macOS grep agrees.
if [ ! -f "$DIST/sitemap-0.xml" ]; then
    # Without this guard the check below reports "ok" for a sitemap that was never
    # built, which is the one situation it most needs to be loud about.
    fail "sitemap-0.xml is missing, cannot check lastmod coverage"
else
    no_lastmod=$(sed 's|</url>|</url>\
|g' "$DIST/sitemap-0.xml" | grep -Ec '<loc>https://bencrane\.net/(blog|projects)/[a-z0-9/-]+/</loc></url>') || no_lastmod=0
    if [ "$no_lastmod" -eq 0 ]; then
        pass "every blog/project URL carries a lastmod"
    else
        fail "$no_lastmod blog/project URL(s) in sitemap-0.xml have no lastmod"
    fi
fi

echo "- icons"
contains index.html 'rel="apple-touch-icon"'
contains index.html 'rel="manifest"'
contains index.html 'name="theme-color"'

echo "- feed"
contains rss.xml '<pubDate>Sun, 06 Oct 2019'

echo "- assets"
contains blog/js-dice/index.html 'katex'
if ls "$DIST"/_astro/KaTeX_*.woff2 >/dev/null 2>&1; then
    pass "KaTeX fonts emitted"
else
    fail "no KaTeX_*.woff2 in _astro/ — math will render in a fallback font"
fi

# Drafts are excluded by src/utils/data-utils.ts. Every page that lists posts or
# projects must go through getPublishedPosts()/getPublishedProjects() — a new
# listing page that calls getCollection() directly would publish these without
# any other signal.
echo "- drafts stay unpublished"
for draft in \
    blog/one-database-per-tenant-durable-objects \
    blog/value-before-the-signup-wall \
    blog/delta-sync-instant-startup-rust-tui \
    blog/calm-until-critical \
    projects/ynab-dashboard; do
    missing "$draft/index.html"
done
absent_everywhere 'Draft — notes only'
absent_everywhere 'One SQLite Database per Tenant'
absent_everywhere 'A Rust terminal dashboard for YNAB'

echo "- regressions"
absent_everywhere 'localhost'
absent_everywhere 'dante-preview'
absent_everywhere 'Embark on a journey'
absent_everywhere 'Astro Basics'

echo
if [ "$fails" -eq 0 ]; then
    echo "All smoke checks passed."
else
    echo "$fails smoke check(s) failed."
    exit 1
fi
