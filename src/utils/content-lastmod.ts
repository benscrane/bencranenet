import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Build-time only. This is imported by astro.config.mjs, which is evaluated before
// the content layer exists, so getCollection() is not available there and the
// sitemap's serialize() callback receives nothing but a URL. So we read the same
// Markdown files the glob loader reads and recover just the dates.
//
// Nothing under src/pages should import this — pages have getCollection() and must
// go through src/utils/data-utils.ts instead.
//
// The id derivation mirrors Astro's glob loader: path relative to the collection
// base, minus the extension. The loader additionally slugifies each segment, so a
// file named `My Post.md` keys as `My Post` here but `my-post` there, and would
// silently lose its lastmod. scripts/smoke.sh asserts that every blog and project
// URL carries a lastmod, which is what catches that.

const CONTENT_DIR = fileURLToPath(new URL('../content', import.meta.url));
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;
const MARKDOWN = /\.mdx?$/;

type Entry = { id: string; lastmod: string };

function readScalar(frontmatter: string, key: string) {
    const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, 'm'));
    return match ? match[1].replace(/^['"]|['"]$/g, '') : undefined;
}

// Emit a date-only W3C datetime. Round-tripping through Date#toISOString() is
// timezone-dependent: 'Oct 06 2019' parses as *local* midnight, so a machine east of
// UTC would serialize it as 2019-10-05 while CI writes 2019-10-06. Reading the local
// components back out is stable in every timezone. An already-ISO value is taken
// verbatim rather than re-parsed, since bare 'YYYY-MM-DD' parses as UTC, not local,
// and so must not go through the same branch.
function toW3CDate(raw: string) {
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return undefined;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

function readCollection(name: string): Entry[] {
    const base = path.join(CONTENT_DIR, name);
    const entries: Entry[] = [];

    for (const file of readdirSync(base, { recursive: true })) {
        const relative = String(file).split(path.sep).join('/');
        if (!MARKDOWN.test(relative)) continue;

        const block = readFileSync(path.join(base, relative), 'utf8').match(FRONTMATTER)?.[1];
        if (!block) continue;
        // Drafts generate no page, so they can never get their own sitemap entry.
        // Skipping them here is still load-bearing: without it an unpublished draft
        // would set the *listing* page's lastmod to a date nothing on the site shows.
        if (readScalar(block, 'draft') === 'true') continue;

        const raw = readScalar(block, 'updatedDate') ?? readScalar(block, 'publishDate');
        const lastmod = raw ? toW3CDate(raw) : undefined;
        if (!lastmod) continue;

        entries.push({ id: relative.replace(MARKDOWN, ''), lastmod });
    }

    return entries;
}

// YYYY-MM-DD sorts lexicographically, so a plain string sort is the date sort.
function newest(entries: Entry[]) {
    return entries
        .map((entry) => entry.lastmod)
        .sort()
        .at(-1);
}

/** Map of site-relative pathname -> YYYY-MM-DD, for sitemap <lastmod>. */
export function buildLastmodMap() {
    const map = new Map<string, string>();
    const posts = readCollection('blog');
    const projects = readCollection('projects');

    for (const post of posts) map.set(`/blog/${post.id}/`, post.lastmod);
    for (const project of projects) map.set(`/projects/${project.id}/`, project.lastmod);

    // A listing page is exactly as fresh as the newest thing it lists. /contact/ and
    // the tag pages get none: the pages collection carries no dates, and a tag page's
    // freshness is already covered by the posts it lists.
    const blogNewest = newest(posts);
    const projectsNewest = newest(projects);
    const siteNewest = newest([...posts, ...projects]);
    if (blogNewest) map.set('/blog/', blogNewest);
    if (projectsNewest) map.set('/projects/', projectsNewest);
    if (siteNewest) map.set('/', siteNewest);

    return map;
}
