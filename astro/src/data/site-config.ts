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
}

const siteConfig: SiteConfig = {
    title: 'Ben Crane',
    website: 'https://bencrane.net',
};

export default siteConfig;