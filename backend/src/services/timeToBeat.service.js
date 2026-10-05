import Game from '../models/Game.js';
import igdb from '../lib/igdb.js';
import logger from '../lib/logger.js';
import { mapTimeToBeat } from '../lib/mappers.js';
import { buildTimeToBeatQuery } from './igdbQuery.js';

// How long a game takes to beat rarely changes, so a month-old answer is fine.
export const TIME_TO_BEAT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CHUNK = 50;

// Hours for each IGDB id that IGDB has data for. Missing ids are left out of the map.
export const fetchTimes = async (igdbIds) => {
    const hours = new Map();
    for (let i = 0; i < igdbIds.length; i += CHUNK) {
        const { data } = await igdb.post('/game_time_to_beats', buildTimeToBeatQuery(igdbIds.slice(i, i + CHUNK)));
        for (const row of data) {
            const value = mapTimeToBeat(row);
            if (value !== null) hours.set(row.game_id, value);
        }
    }
    return hours;
};

// Hours to beat (or null when unknown) for saved games, keyed by the game's Mongo id.
// Fresh answers come from the database; the rest are fetched together in one go and stored,
// including "unknown", so a game IGDB can't answer isn't asked about again for a month.
// If IGDB is down, whatever we already have is used and nothing is stored.
export const ensureTimesToBeat = async (games, now = Date.now()) => {
    const result = new Map();
    const stale = [];

    for (const game of games) {
        const id = String(game._id);
        const savedAt = game.timeToBeat?.fetchedAt;
        if (savedAt && now - new Date(savedAt).getTime() < TIME_TO_BEAT_TTL_MS) {
            result.set(id, game.timeToBeat.hours ?? null);
        } else if (game.igdbId) {
            stale.push(game);
        } else {
            result.set(id, null);
        }
    }
    if (stale.length === 0) return result;

    try {
        const fetched = await fetchTimes(stale.map((g) => g.igdbId));
        const writes = stale.map((game) => {
            const hours = fetched.get(game.igdbId) ?? null;
            result.set(String(game._id), hours);
            return {
                updateOne: {
                    filter: { _id: game._id },
                    update: { $set: { timeToBeat: { hours, fetchedAt: new Date(now) } } },
                },
            };
        });
        await Game.bulkWrite(writes);
    } catch (err) {
        logger.warn({ err: err.message }, 'Time to beat unavailable');
        for (const game of stale) result.set(String(game._id), game.timeToBeat?.hours ?? null);
    }
    return result;
};
