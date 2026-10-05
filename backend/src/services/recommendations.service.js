import Game from '../models/Game.js';
import Review from '../models/Review.js';
import GameStatus from '../models/GameStatus.js';
import { resolveLocalGameId } from './game.service.js';
import { toObjectId } from './stats.service.js';
import { LIKED, genreAffinity, popularityScore, rank, similarity } from './recommend.js';

const MAX_SHARED_ROWS = 5000; // reviews of games the member rated, from other members
const MAX_NEIGHBOURS = 100;
const SOURCE_GAMES = 5; // liked games whose IGDB "similar games" are used
const GENRE_POOL = 200;
const CARD_FIELDS = 'title coverImage genre igdbId averageRating';

const card = (game) => ({
    _id: game._id,
    igdbId: game.igdbId,
    title: game.title,
    coverImage: game.coverImage,
    genre: game.genre ?? [],
    averageRating: game.averageRating ?? 0,
    rating: game.averageRating || 0, // GameCard reads `rating`
});

const popularFallback = async (tracked, limit) => {
    const groups = await Review.aggregate([
        { $group: { _id: '$game', average: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 200 },
    ]);
    const top = groups
        .filter((g) => !tracked.has(String(g._id)))
        .map((g) => ({ id: String(g._id), score: popularityScore(g) }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, limit);

    const games = await Game.find({ _id: { $in: top.map((t) => t.id) } })
        .select(CARD_FIELDS)
        .lean();
    const byId = new Map(games.map((g) => [String(g._id), g]));
    return top
        .filter((t) => byId.has(t.id))
        .map((t) => ({
            game: card(byId.get(t.id)),
            score: Math.round(t.score * 100) / 100,
            reasons: ['Popular with Hitbox members'],
        }));
};

// Personalised picks for a member, or a popularity list until they have rated something.
export const getRecommendations = async (userId, limit = 12) => {
    const [reviews, statuses] = await Promise.all([
        Review.find({ user: userId }).select('game rating').lean(),
        GameStatus.find({ user: userId }).select('game').lean(),
    ]);
    const mine = new Map(reviews.map((r) => [String(r.game), r.rating]));
    const tracked = new Set(statuses.map((s) => String(s.game)));

    if (mine.size === 0) {
        return { personalized: false, items: await popularFallback(tracked, limit) };
    }

    // Members who rated at least one of the same games, ordered by how alike they rate.
    const sharedRows = await Review.find({ game: { $in: [...mine.keys()] }, user: { $ne: userId } })
        .select('user game rating')
        .limit(MAX_SHARED_ROWS)
        .lean();
    const sharedByUser = new Map();
    for (const { user, game, rating } of sharedRows) {
        const key = String(user);
        if (!sharedByUser.has(key)) sharedByUser.set(key, new Map());
        sharedByUser.get(key).set(String(game), rating);
    }
    const closest = [...sharedByUser]
        .map(([user, ratings]) => ({ user, similarity: similarity(mine, ratings) }))
        .filter((n) => n.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity || a.user.localeCompare(b.user))
        .slice(0, MAX_NEIGHBOURS);

    const neighbourRows = closest.length
        ? await Review.find({ user: { $in: closest.map((n) => n.user) } })
              .select('user game rating')
              .lean()
        : [];
    const ratingsByUser = new Map();
    for (const { user, game, rating } of neighbourRows) {
        const key = String(user);
        if (!ratingsByUser.has(key)) ratingsByUser.set(key, new Map());
        ratingsByUser.get(key).set(String(game), rating);
    }
    const neighbours = closest.map((n) => ({ ratings: ratingsByUser.get(n.user), similarity: n.similarity }));

    // The member's own games give their genre taste and, through IGDB, similar titles.
    const myGames = await Game.find({ _id: { $in: [...mine.keys()] } })
        .select('title genre extras.similarGames')
        .lean();
    const genresByGame = new Map(myGames.map((g) => [String(g._id), g.genre ?? []]));
    const affinity = genreAffinity(mine, genresByGame);
    const topGenres = [...affinity]
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([g]) => g);

    const liked = myGames
        .filter((g) => mine.get(String(g._id)) >= LIKED)
        .sort((a, b) => mine.get(String(b._id)) - mine.get(String(a._id)))
        .slice(0, SOURCE_GAMES);
    const similarIgdb = new Map(); // igdbId -> { title of the liked game, IGDB entry }
    for (const source of liked) {
        for (const similar of source.extras?.similarGames ?? []) {
            if (!similarIgdb.has(similar.igdbId)) similarIgdb.set(similar.igdbId, { from: source.title, similar });
        }
    }

    // Everything that could be recommended: what neighbours rated, the genre pool, and IGDB's similar games.
    const [genrePool, localSimilar] = await Promise.all([
        topGenres.length
            ? Game.find({ genre: { $in: topGenres } })
                  .select('_id')
                  .limit(GENRE_POOL)
                  .lean()
            : [],
        similarIgdb.size
            ? Game.find({ igdbId: { $in: [...similarIgdb.keys()] } })
                  .select('_id igdbId')
                  .lean()
            : [],
    ]);
    const similarTo = new Map();
    const localByIgdb = new Map(localSimilar.map((g) => [g.igdbId, String(g._id)]));
    for (const [igdbId, { from }] of similarIgdb) similarTo.set(localByIgdb.get(igdbId) ?? `igdb:${igdbId}`, from);

    const candidateIds = new Set(
        [
            ...neighbours.flatMap((n) => [...n.ratings.keys()]),
            ...genrePool.map((g) => String(g._id)),
            ...localByIgdb.values(),
        ].filter((id) => !mine.has(id) && !tracked.has(id)),
    );
    const candidateGames = await Game.find({ _id: { $in: [...candidateIds] } })
        .select(CARD_FIELDS)
        .lean();
    const candidates = new Map(candidateGames.map((g) => [String(g._id), g]));

    const ranked = rank({ mine, tracked, neighbours, candidates, genresByGame, similarTo, limit });

    const items = ranked.map(({ id, score, reasons }) => {
        const local = candidates.get(id);
        if (local) return { game: card(local), score, reasons };
        // Not saved locally: show what IGDB told us, addressed by IGDB id like search results.
        const { similar } = similarIgdb.get(Number(id.slice('igdb:'.length)));
        return {
            game: card({
                _id: similar.igdbId,
                igdbId: similar.igdbId,
                title: similar.title,
                coverImage: similar.coverImage,
            }),
            score,
            reasons,
        };
    });

    return { personalized: true, items };
};

// "Members who liked this also liked": other games loved by the people who loved this one.
export const getAlsoLiked = async (ref, limit = 12) => {
    const gameId = await resolveLocalGameId(ref);
    if (!gameId) return [];

    const fans = await Review.find({ game: gameId, rating: { $gte: LIKED } })
        .select('user')
        .limit(500)
        .lean();
    if (fans.length === 0) return [];

    const groups = await Review.aggregate([
        {
            $match: {
                user: { $in: fans.map((f) => f.user) },
                game: { $ne: toObjectId(gameId) },
                rating: { $gte: LIKED },
            },
        },
        { $group: { _id: '$game', supporters: { $sum: 1 }, average: { $avg: '$rating' } } },
        { $sort: { supporters: -1, average: -1, _id: 1 } },
        { $limit: limit },
    ]);

    const games = await Game.find({ _id: { $in: groups.map((g) => g._id) } })
        .select(CARD_FIELDS)
        .lean();
    const byId = new Map(games.map((g) => [String(g._id), g]));
    return groups
        .filter((g) => byId.has(String(g._id)))
        .map((g) => ({ ...card(byId.get(String(g._id))), supporters: g.supporters }));
};
