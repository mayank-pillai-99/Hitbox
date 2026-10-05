import User from '../models/User.js';
import List from '../models/List.js';
import igdb from '../lib/igdb.js';
import logger from '../lib/logger.js';
import { mapIGDBGame } from '../lib/mappers.js';
import { containsPattern, prefixPattern } from '../lib/regex.js';
import { buildBrowseQuery } from './igdbQuery.js';
import { withLocalData } from './game.service.js';

const PER_KIND = 5;
const CACHE_TTL_MS = 60 * 1000;
const CACHE_MAX = 200;
const cache = new Map(); // lowercased query -> { value, expires }

export const clearSearchCache = () => cache.clear();

const searchGames = async (q) => {
    const { data } = await igdb.post('/games', buildBrowseQuery({ search: q, limit: PER_KIND }));
    return withLocalData(data.map(mapIGDBGame));
};

const searchMembers = (q) =>
    User.find({ username: prefixPattern(q) })
        .select('username profilePicture')
        .sort({ username: 1 })
        .limit(PER_KIND)
        .lean();

const searchLists = async (q) => {
    const lists = await List.find({ name: containsPattern(q) })
        .select('name games user')
        .populate('user', 'username')
        .sort({ createdAt: -1 })
        .limit(PER_KIND)
        .lean();
    return lists.map((list) => ({
        _id: list._id,
        name: list.name,
        gameCount: list.games.length,
        user: list.user ? { username: list.user.username } : null,
    }));
};

// One query across games (IGDB), members (username starts with) and lists (name contains).
// If IGDB fails, members and lists are still returned: a partial answer beats none for autocomplete.
export const searchAll = async (q, now = Date.now()) => {
    const key = q.toLowerCase();
    const hit = cache.get(key);
    if (hit && hit.expires > now) return hit.value;

    const [games, members, lists] = await Promise.allSettled([searchGames(q), searchMembers(q), searchLists(q)]);

    // Members and lists come from our own database, so a failure there is a real error.
    if (members.status === 'rejected') throw members.reason;
    if (lists.status === 'rejected') throw lists.reason;
    if (games.status === 'rejected') logger.warn({ err: games.reason.message }, 'Game search unavailable');

    const value = {
        games: games.status === 'fulfilled' ? games.value : [],
        members: members.value,
        lists: lists.value,
    };

    // Don't cache a result that is missing games because IGDB was down.
    if (games.status === 'fulfilled') {
        if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
        cache.set(key, { value, expires: now + CACHE_TTL_MS });
    }
    return value;
};
