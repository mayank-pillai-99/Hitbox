import { SITE_URL } from '@/utils/site';

// Public landing pages. Game, list and member pages are discovered by following links from these.
export default function sitemap() {
    return ['', '/games', '/lists', '/members'].map((path) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: path === '' ? 'daily' : 'weekly',
    }));
}
