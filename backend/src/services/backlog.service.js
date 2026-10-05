import GameStatus from '../models/GameStatus.js';
import Game from '../models/Game.js';
import Review from '../models/Review.js';
import { genreAffinity } from './recommend.js';
import { rankBacklog, summarize } from './backlog.js';
import { ensureTimesToBeat } from './timeToBeat.service.js';

const CARD_FIELDS = 'title coverImage genre igdbId averageRating releaseDate timeToBeat';

// The member's want-to-play games, ranked by fit and annotated with hours to beat and a reason.
export const getBacklog = async (userId, time = 'any') => {
    const [statuses, reviews] = await Promise.all([
        GameStatus.find({ user: userId, status: 'want_to_play' }).select('game').lean(),
        Review.find({ user: userId }).select('game rating').lean(),
    ]);
    if (statuses.length === 0) return { summary: { games: 0, hours: 0, unknown: 0 }, items: [], time };

    // Taste comes from the genres of games the member has rated.
    const mine = new Map(reviews.map((r) => [String(r.game), r.rating]));
    const [backlogGames, ratedGames] = await Promise.all([
        Game.find({ _id: { $in: statuses.map((s) => s.game) } })
            .select(CARD_FIELDS)
            .lean(),
        mine.size
            ? Game.find({ _id: { $in: [...mine.keys()] } })
                  .select('genre')
                  .lean()
            : [],
    ]);
    const affinity = genreAffinity(mine, new Map(ratedGames.map((g) => [String(g._id), g.genre ?? []])));

    const times = await ensureTimesToBeat(backlogGames);
    const all = backlogGames.map((game) => ({
        id: String(game._id),
        game,
        hours: times.get(String(game._id)) ?? null,
    }));

    const ranked = rankBacklog({ items: all, affinity, time });
    return {
        summary: summarize(all),
        time,
        items: ranked.map(({ game, hours, fit, reason }) => ({
            game: {
                _id: game._id,
                igdbId: game.igdbId,
                title: game.title,
                coverImage: game.coverImage,
                genre: game.genre ?? [],
                releaseDate: game.releaseDate,
                rating: game.averageRating || 0,
            },
            hours,
            fit,
            reason,
        })),
    };
};
