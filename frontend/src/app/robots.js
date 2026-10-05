import { SITE_URL } from '@/utils/site';

export default function robots() {
    return {
        rules: [{ userAgent: '*', allow: '/', disallow: ['/profile', '/settings', '/lists/new'] }],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
