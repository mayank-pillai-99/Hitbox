import Game from '../models/Game.js';
import Review from '../models/Review.js';
import igdb from '../lib/igdb.js';
import { mapIGDBGame } from '../lib/mappers.js';
import { buildDetailQuery } from './igdbQuery.js';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
export const isObjectId = (value) => OBJECT_ID.test(String(value));

// Finds a locally saved game by Mongo id or IGDB id. Returns null when unknown.
export const findLocalGame = (ref) => (isObjectId(ref) ? Game.findById(ref) : Game.findOne({ igdbId: Number(ref) }));

// Resolves a game ref to its local Mongo _id, or null if the game isn't saved yet.
export const resolveLocalGameId = async (ref) => {
    if (isObjectId(ref)) return ref;
    const game = await Game.findOne({ igdbId: Number(ref) }).select('_id');
    return game?._id ?? null;
};

export const fetchIGDBGame = async (igdbId) => {
    const { data } = await igdb.post('/games', buildDetailQuery(igdbId));
    return data?.[0] ? mapIGDBGame(data[0]) : null;
};

// Games live in IGDB; a local copy is only saved once someone reviews, lists or tracks one.
export const findOrCreateGame = async (ref) => {
    const local = await findLocalGame(ref);
    if (local || isObjectId(ref)) return local;

    const mapped = await fetchIGDBGame(ref);
    if (!mapped) return null;

    try {
        return await Game.create({
            igdbId: mapped.igdbId,
            title: mapped.title,
            slug: mapped.slug,
            description: mapped.description,
            coverImage: mapped.coverImage,
            releaseDate: mapped.releaseDate,
            genre: mapped.genre,
            platforms: mapped.platforms,
            developer: mapped.developer,
            publisher: mapped.publisher,
            averageRating: 0,
        });
    } catch (err) {
        // Two requests saved the same game at once; the other one won.
        if (err.code === 11000) return Game.findOne({ igdbId: mapped.igdbId });
        throw err;
    }
};

export const updateGameRating = async (gameId) => {
    const [stats] = await Review.aggregate([
        { $match: { game: gameId } },
        { $group: { _id: '$game', averageRating: { $avg: '$rating' } } },
    ]);
    const rating = stats ? Math.round(stats.averageRating * 10) / 10 : 0;
    await Game.findByIdAndUpdate(gameId, { averageRating: rating });
};
