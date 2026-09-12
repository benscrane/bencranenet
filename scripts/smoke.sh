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
contains index.html 'property="og:image" content="https://bencrane.net/og-image.png"'
contains blog/js-dice/index.html 'rel="canonical" href="https://bencrane.net/blog/js-dice/"'
contains robots.txt 'Sitemap: https://bencrane.net/sitemap-index.xml'

echo "- feed"
contains rss.xml '<pubDate>Sun, 06 Oct 2019'

echo "- assets"
contains blog/js-dice/index.html 'katex'
if ls "$DIST"/_astro/KaTeX_*.woff2 >/dev/null 2>&1; then
    pass "KaTeX fonts emitted"
else
    fail "no KaTeX_*.woff2 in _astro/ — math will render in a fallback font"
fi

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
