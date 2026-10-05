import Game from '../models/Game.js';
import igdb from '../lib/igdb.js';
import { mapIGDBExtras } from '../lib/mappers.js';
import { buildExtrasQuery } from './igdbQuery.js';
import { findLocalGame, isObjectId } from './game.service.js';

// Extras change rarely, so a week-old copy is fine.
export const EXTRAS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Games nobody has saved yet can't hold a copy, so they get a short in-memory one.
const MEMORY_TTL_MS = 60 * 60 * 1000;
const MEMORY_MAX = 500;
const memory = new Map(); // igdbId -> { extras, expires }

export const clearExtrasMemory = () => memory.clear();

const emptyExtras = () => ({ screenshots: [], videos: [], similarGames: [] });

// Similar games are addressed by IGDB id until someone saves them, like search results.
const toResponse = ({ screenshots = [], videos = [], similarGames = [] }) => ({
    screenshots: screenshots.map(({ thumb, full }) => ({ thumb, full })),
    videos: videos.map(({ youtubeId, name }) => ({ youtubeId, name })),
    similarGames: similarGames.map(({ igdbId, title, coverImage }) => ({ _id: igdbId, igdbId, title, coverImage })),
});

const remember = (igdbId, extras, now) => {
    if (memory.size >= MEMORY_MAX) memory.delete(memory.keys().next().value); // oldest first
    memory.set(igdbId, { extras, expires: now + MEMORY_TTL_MS });
};

// Returns null when the game doesn't exist. Saved games keep their extras in MongoDB;
// others use a short in-memory cache, so browsing never creates a game record.
export const getGameExtras = async (ref, now = Date.now()) => {
    const local = await findLocalGame(ref);
    if (!local && isObjectId(ref)) return null;

    const igdbId = local ? local.igdbId : Number(ref);
    if (!igdbId) return toResponse(emptyExtras());

    const savedAt = local?.extras?.fetchedAt;
    if (savedAt && now - savedAt.getTime() < EXTRAS_TTL_MS) return toResponse(local.extras);

    const cached = memory.get(igdbId);
    if (!local && cached && cached.expires > now) return toResponse(cached.extras);

    const { data } = await igdb.post('/games', buildExtrasQuery(igdbId));
    if (!data?.[0]) return null;

    const { screenshots, videos, similarGames } = mapIGDBExtras(data[0]);
    const extras = { screenshots, videos, similarGames: similarGames.map(({ _id, ...rest }) => rest) };

    if (local) {
        await Game.updateOne({ _id: local._id }, { $set: { extras: { ...extras, fetchedAt: new Date(now) } } });
    } else {
        remember(igdbId, extras, now);
    }

    return toResponse(extras);
};
