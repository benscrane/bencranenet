interface Image {
    src: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
}

interface Link {
    text: string;
    href: string;
}

interface Hero {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
}

interface SiteConfig {
    title: string;
    subtitle?: string;
    description?: string;
    logo?: Image;
    website: string;
    image?: Image;
    hero?: Hero;
    socialLinks?: Link[];
    footerNavLinks?: Link[];
    headerNavLinks?: Link[];
    projectsPerPage?: number;
    blogPostsPerPage?: number;
}

const siteConfig: SiteConfig = {
    title: 'Ben Crane',
    description: 'Ben Crane — software engineer and engineering manager working on healthcare data. Side projects and write-ups.',
    website: 'https://bencrane.net',
    image: {
        src: '/og-image.png',
        alt: 'Ben Crane — software, side projects, and the occasional write-up.',
        width: 1200,
        height: 630
    },
    hero: {
        title: 'Software, side projects, and the occasional write-up.',
        text: "I'm Ben Crane, a software engineer and engineering manager working on healthcare data. Off the clock, I build side projects and write up what I learn here.",
        actions: [
            {
                text: 'Get in Touch',
                href: '/contact'
            }
        ]
    },
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/benscrane'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/benscrane/'
        },
        {
            text: 'Bluesky',
            href: 'https://bsky.app/profile/bencrane.net'
        }
    ],
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        }
    ]
};

export default siteConfig;
