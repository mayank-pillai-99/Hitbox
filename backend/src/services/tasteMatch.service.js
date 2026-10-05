import Game from '../models/Game.js';
import Review from '../models/Review.js';
import { compareTaste } from './tasteMatch.js';

const LIST_SIZE = 6;

const ratingsOf = async (userId) => {
    const reviews = await Review.find({ user: userId }).select('game rating').lean();
    return new Map(reviews.map((r) => [String(r.game), r.rating]));
};

// How closely the signed-in member's ratings agree with another member's, with the games behind it.
export const matchMembers = async (viewerId, otherId) => {
    const [mine, theirs] = await Promise.all([ratingsOf(viewerId), ratingsOf(otherId)]);
    const result = compareTaste(mine, theirs);

    const shown = [...result.bothLoved.slice(0, LIST_SIZE), ...result.disagree.slice(0, LIST_SIZE)];
    const games = shown.length
        ? await Game.find({ _id: { $in: shown.map((s) => s.game) } })
              .select('title coverImage igdbId')
              .lean()
        : [];
    const byId = new Map(games.map((g) => [String(g._id), g]));

    const withGame = (rows) =>
        rows
            .slice(0, LIST_SIZE)
            .filter((row) => byId.has(row.game))
            .map((row) => {
                const game = byId.get(row.game);
                return {
                    game: { _id: game._id, igdbId: game.igdbId, title: game.title, coverImage: game.coverImage },
                    mine: row.mine,
                    theirs: row.theirs,
                };
            });

    return {
        shared: result.shared,
        percent: result.percent,
        confidence: result.confidence,
        bothLoved: withGame(result.bothLoved),
        disagree: withGame(result.disagree),
    };
};
