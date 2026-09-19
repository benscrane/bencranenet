// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import siteConfig from './src/data/site-config';
import { buildLastmodMap } from './src/utils/content-lastmod';

// @astrojs/sitemap decides *which* URLs ship — it enumerates real build output, which
// is why /404 and /rss.xml are already absent and why no `filter` is set. This map
// only supplies *when*: astro.config is evaluated before the content layer exists, so
// getCollection() is unavailable and serialize() receives nothing but the URL.
// See src/utils/content-lastmod.ts.
//
// changefreq and priority are deliberately unset. Google ignores both, and a hand-set
// value stops being true the first time content moves.
const lastmodByPath = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
    site: siteConfig.website,
    vite: {
        plugins: [tailwindcss()]
    },
    integrations: [
        mdx(),
        sitemap({
            serialize(item) {
                const lastmod = lastmodByPath.get(new URL(item.url).pathname);
                if (lastmod) item.lastmod = lastmod;
                return item;
            }
        })
    ]
});
