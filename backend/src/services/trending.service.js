import Game from '../models/Game.js';
import Review from '../models/Review.js';
import GameStatus from '../models/GameStatus.js';
import igdb from '../lib/igdb.js';
import logger from '../lib/logger.js';
import { mapIGDBGame } from '../lib/mappers.js';
import { buildBrowseQuery, buildPopularityQuery, buildTrendingDetailsQuery } from './igdbQuery.js';

// "Popular this week" blends two signals:
//   - IGDB's visit popularity across the whole catalog, refreshed by IGDB daily
//   - Hitbox's own activity in the last 7 days: reviews count double, status changes once
// Either alone is thin: IGDB knows nothing about this community, and a small community
// has too little weekly activity to rank a whole catalog.

export const WINDOW_DAYS = 7;
export const POOL_SIZE = 40; // how many of IGDB's most-visited games are considered
export const RESULT_SIZE = 12; // computed once; callers take a prefix
export const CACHE_TTL_MS = 15 * 60 * 1000;
const FULL_ACTIVITY = 3; // this much weekly activity earns the full community boost

let cache = { results: null, expires: 0 };
export const clearTrendingCache = () => {
    cache = { results: null, expires: 0 };
};

// igdbRanked: IGDB ids, most visited first. activity: Map igdbId -> weekly activity points.
// Each signal contributes up to 1 point: rank in IGDB's list, and Hitbox activity.
export const scoreTrending = (igdbRanked, activity) => {
    const rankScore = new Map(igdbRanked.map((id, i) => [id, 1 - i / Math.max(igdbRanked.length, 1)]));
    const ids = new Set([...igdbRanked, ...activity.keys()]);

    return [...ids]
        .map((id) => ({
            id,
            score: (rankScore.get(id) ?? 0) + Math.min((activity.get(id) ?? 0) / FULL_ACTIVITY, 1),
        }))
        .sort((a, b) => b.score - a.score || a.id - b.id);
};

// Weekly activity points per IGDB id, for games Hitbox has saved.
const weeklyActivity = async (now) => {
    const since = new Date(now - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [reviews, statuses] = await Promise.all([
        Review.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: '$game', n: { $sum: 1 } } }]),
        GameStatus.aggregate([
            { $match: { updatedAt: { $gte: since } } },
            { $group: { _id: '$game', n: { $sum: 1 } } },
        ]),
    ]);

    const points = new Map();
    for (const { _id, n } of reviews) points.set(String(_id), (points.get(String(_id)) ?? 0) + n * 2);
    for (const { _id, n } of statuses) points.set(String(_id), (points.get(String(_id)) ?? 0) + n);
    if (points.size === 0) return new Map();

    const games = await Game.find({ _id: { $in: [...points.keys()] }, igdbId: { $ne: null } })
        .select('igdbId')
        .lean();
    return new Map(games.map((g) => [g.igdbId, points.get(String(g._id))]));
};

const withLocalData = async (mapped) => {
    const local = await Game.find({ igdbId: { $in: mapped.map((g) => g.igdbId) } })
        .select('igdbId averageRating')
        .lean();
    const byIgdbId = new Map(local.map((g) => [g.igdbId, g]));
    return mapped.map((game) => {
        const saved = byIgdbId.get(game.igdbId);
        if (!saved) return game;
        return { ...game, _id: saved._id, ...(saved.averageRating > 0 && { rating: saved.averageRating }) };
    });
};

// Used if IGDB's popularity data is unavailable: the most-rated releases of the past year.
const recentlyPopular = async (now) => {
    const year = 365 * 24 * 60 * 60 * 1000;
    const dates = `${new Date(now - year).toISOString().slice(0, 10)},${new Date(now).toISOString().slice(0, 10)}`;
    const { data } = await igdb.post('/games', buildBrowseQuery({ dates, page: 1 }));
    return data.map(mapIGDBGame);
};

export const getTrending = async (limit = 6, now = Date.now()) => {
    if (cache.results && cache.expires > now) return cache.results.slice(0, limit);

    let results;
    try {
        const [{ data: popular }, activity] = await Promise.all([
            igdb.post('/popularity_primitives', buildPopularityQuery(POOL_SIZE)),
            weeklyActivity(now),
        ]);
        const igdbRanked = popular.map((p) => p.game_id);

        const ranking = scoreTrending(igdbRanked, activity);
        const { data: details } = await igdb.post(
            '/games',
            buildTrendingDetailsQuery(
                ranking.map((r) => r.id),
                now / 1000,
            ),
        );
        const byId = new Map(details.map((d) => [d.id, d]));
        const ordered = ranking.filter((r) => byId.has(r.id)).slice(0, RESULT_SIZE);
        if (ordered.length === 0) throw new Error('No trending games found');

        results = await withLocalData(ordered.map((r) => mapIGDBGame(byId.get(r.id))));
    } catch (err) {
        logger.warn({ err: err.message }, 'Trending unavailable, falling back to recent popular releases');
        results = (await withLocalData(await recentlyPopular(now))).slice(0, RESULT_SIZE);
    }

    cache = { results, expires: now + CACHE_TTL_MS };
    return results.slice(0, limit);
};
