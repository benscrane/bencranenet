import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config';
import { sortItemsByDateDesc } from '../utils/data-utils';

export async function GET(context: APIContext) {
    const posts = (await getCollection('blog')).sort(sortItemsByDateDesc);

    return rss({
        title: siteConfig.title,
        description: siteConfig.description || `${siteConfig.title}'s Blog`,
        // context.site is URL | undefined (it is only set when astro.config
        // defines `site`); fall back to the configured website so the feed
        // always emits absolute links.
        site: context.site ?? siteConfig.website,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.excerpt || post.data.seo?.description || '',
            link: `/blog/${post.id}/`,
            // pubDate is the original publication date and must stay that way —
            // spreading updatedDate over it here made republished posts look
            // brand new to every feed reader.
            pubDate: post.data.publishDate,
        })),
        customData: `<language>en-us</language>`,
    });
}
