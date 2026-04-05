import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config';
import { sortItemsByDateDesc } from '../utils/data-utils';

export async function GET(context: any) {
    const posts = (await getCollection('blog')).sort(sortItemsByDateDesc);

    return rss({
        title: siteConfig.title,
        description: siteConfig.description || `${siteConfig.title}'s Blog`,
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.excerpt || post.data.seo?.description || '',
            link: `/blog/${post.id}/`,
            pubDate: post.data.publishDate,
            ...(post.data.updatedDate && { pubDate: post.data.updatedDate }),
        })),
        customData: `<language>en-us</language>`,
    });
}
