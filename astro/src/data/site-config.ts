interface Image {
    src: string;
    alt?: string;
    caption?: string;
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
};

interface Subscribe {
    title?: string;
    text?: string;
    formUrl: string;
};

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
    subscribe?: Subscribe;
}

const siteConfig: SiteConfig = {
    title: 'Ben Crane',
    website: 'https://bencrane.net',
    hero: {
        text: "Hi there, I'm Ben Crane, a software engineer and engineering manager currently working at Redox to make healthcare data useful.",
        actions: [
            {
                text: 'Get in Touch',
                href: '/contact'
            },
        ],
    },
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/benscrane',
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/benscrane/',
        },
        {
            text: 'Bluesky',
            href: 'https://bsky.app/profile/bencrane.net',
        },
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
        },
    ],
};

export default siteConfig;