// Builders for IGDB's Apicalypse query language. Everything that reaches a query
// string passes through here, so user input can't add clauses or break out of a string.

// Each name maps to the IGDB ids it covers. IGDB has no plain "Action" genre,
// so it covers Fighting (4) and Hack and slash/Beat 'em up (25).
export const GENRES = {
    rpg: [12],
    action: [4, 25],
    adventure: [31],
    shooter: [5],
    strategy: [15],
    simulator: [13],
    puzzle: [9],
    racing: [10],
    sport: [14],
};

export const PLATFORMS = {
    pc: [6],
    playstation: [48],
    xbox: [49],
    nintendo: [130],
    mac: [14],
    ios: [39],
    android: [34],
};

const SORTS = {
    '-released': 'first_release_date desc',
    released: 'first_release_date asc',
    '-rating': 'total_rating desc',
    name: 'name asc',
};
const DEFAULT_SORT = 'total_rating_count desc';

export const PAGE_SIZE = 20;

export const LIST_FIELDS =
    'name, cover.url, first_release_date, total_rating, total_rating_count, hypes, summary, genres.name, platforms.name, slug';
export const DETAIL_FIELDS =
    'name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug, involved_companies.developer, involved_companies.publisher, involved_companies.company.name';

export const EXTRAS_FIELDS =
    'screenshots.image_id, videos.video_id, videos.name, similar_games.name, similar_games.cover.url';

export const quote = (value) =>
    `"${String(value)
        .replace(/[\\"]/g, '\\$&')
        .replace(/[\r\n]+/g, ' ')}"`;

const anyOf = (field, ids) => (ids.length === 1 ? `${field} = [${ids[0]}]` : `${field} = (${ids.join(',')})`);

const toUnixSeconds = (value) => {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
};

export function buildBrowseQuery({ search, ordering, platforms, genres, dates, page = 1, limit = PAGE_SIZE }) {
    const where = [];

    const genreIds = genres && GENRES[genres.toLowerCase()];
    if (genreIds) where.push(anyOf('genres', genreIds));

    const platformIds = platforms && PLATFORMS[platforms.toLowerCase()];
    if (platformIds) where.push(anyOf('platforms', platformIds));

    if (dates) {
        const [start, end] = dates.split(',').map(toUnixSeconds);
        if (start !== null && start !== undefined) where.push(`first_release_date >= ${start}`);
        if (end !== null && end !== undefined) where.push(`first_release_date <= ${end}`);
    }

    let query = `fields ${LIST_FIELDS}; limit ${limit}; offset ${(page - 1) * limit};`;
    if (search) query += ` search ${quote(search)};`;
    if (where.length > 0) query += ` where ${where.join(' & ')};`;
    // IGDB doesn't allow `sort` together with `search`; results are relevance-ordered then.
    if (!search) query += ` sort ${SORTS[ordering] || DEFAULT_SORT};`;
    return query;
}

export function buildDetailQuery(igdbId) {
    const id = Number(igdbId);
    if (!Number.isInteger(id) || id <= 0) throw new TypeError('IGDB id must be a positive integer');
    return `fields ${DETAIL_FIELDS}; where id = ${id};`;
}

export function buildExtrasQuery(igdbId) {
    const id = Number(igdbId);
    if (!Number.isInteger(id) || id <= 0) throw new TypeError('IGDB id must be a positive integer');
    return `fields ${EXTRAS_FIELDS}; where id = ${id};`;
}

// IGDB popularity type 1 is "Visits": how much attention each game page is getting right now.
const VISITS_POPULARITY_TYPE = 1;

export const buildPopularityQuery = (limit) => {
    const n = Number(limit);
    if (!Number.isInteger(n) || n < 1 || n > 500) throw new TypeError('limit must be an integer from 1 to 500');
    return `fields game_id, value; where popularity_type = ${VISITS_POPULARITY_TYPE} & game_id != null; sort value desc; limit ${n};`;
};

// Released games with a cover, from a list of IGDB ids. Trending lists show covers, and an
// unreleased or cover-less entry would look broken on the home page.
export const buildTrendingDetailsQuery = (ids, nowSeconds) => {
    const clean = ids.map(Number);
    if (clean.length === 0 || clean.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new TypeError('ids must be positive integers');
    }
    const now = Math.floor(Number(nowSeconds));
    if (!Number.isFinite(now)) throw new TypeError('nowSeconds must be a number');
    return `fields ${LIST_FIELDS}; where id = (${clean.join(',')}) & cover != null & first_release_date != null & first_release_date <= ${now}; limit ${clean.length};`;
};

// Time-to-beat rows for many games at once. Games IGDB has no data for are simply absent.
export const buildTimeToBeatQuery = (ids) => {
    const clean = ids.map(Number);
    if (clean.length === 0 || clean.length > 100 || clean.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new TypeError('ids must be 1 to 100 positive integers');
    }
    return `fields game_id, hastily, normally, completely; where game_id = (${clean.join(',')}); limit ${clean.length};`;
};
