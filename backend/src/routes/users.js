import express from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import GameStatus from '../models/GameStatus.js';
import Game from '../models/Game.js';
import validate from '../middleware/validate.js';
import { notFound } from '../lib/errors.js';
import { getUserStats, pagination } from '../services/stats.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

const RECENT_GAMES = 4;

// Counts rows in `from` that belong to each user, using the index on `user`
// instead of loading every document into the pipeline.
const countFor = (from, as) => ({
    $lookup: {
        from,
        let: { userId: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$user', '$$userId'] } } }, { $count: 'n' }],
        as,
    },
});

const findUserByName = async (username) => {
    const user = await User.findOne({ username });
    if (!user) throw notFound('User not found');
    return user;
};

router.get('/', validate({ query: schemas.users.membersQuery }), async (req, res) => {
    const { page, limit, sort } = req.valid.query;
    const order = sort === 'recent' ? { createdAt: -1 } : { reviewsCount: -1, createdAt: -1 };

    const [users, total] = await Promise.all([
        User.aggregate([
            countFor('reviews', 'reviewCounts'),
            countFor('lists', 'listCounts'),
            {
                $addFields: {
                    reviewsCount: { $ifNull: [{ $first: '$reviewCounts.n' }, 0] },
                    listsCount: { $ifNull: [{ $first: '$listCounts.n' }, 0] },
                },
            },
            { $project: { password: 0, email: 0, reviewCounts: 0, listCounts: 0 } },
            { $sort: order },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]),
        User.countDocuments(),
    ]);

    const userIds = users.map((u) => u._id);
    const [recentByUser, playedByUser] = await Promise.all([
        // Each member's newest reviews, fetched for the whole page in one query.
        Review.aggregate([
            { $match: { user: { $in: userIds } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$user', games: { $push: '$game' } } },
            { $project: { games: { $slice: ['$games', RECENT_GAMES] } } },
        ]),
        GameStatus.aggregate([
            { $match: { user: { $in: userIds }, status: 'played' } },
            { $group: { _id: '$user', count: { $sum: 1 } } },
        ]),
    ]);

    const games = await Game.find({ _id: { $in: recentByUser.flatMap((r) => r.games) } })
        .select('title coverImage')
        .lean();
    const gameById = new Map(games.map((g) => [String(g._id), g]));
    const recentGamesByUser = new Map(recentByUser.map((r) => [String(r._id), r.games]));
    const playedCount = new Map(playedByUser.map((p) => [String(p._id), p.count]));

    res.json({
        members: users.map((user) => ({
            ...user,
            stats: {
                reviews: user.reviewsCount,
                lists: user.listsCount,
                gamesPlayed: playedCount.get(String(user._id)) || 0,
            },
            recentGames: (recentGamesByUser.get(String(user._id)) || [])
                .map((id) => gameById.get(String(id)))
                .filter(Boolean)
                .map((g) => ({ title: g.title, coverImage: g.coverImage })),
        })),
        pagination: pagination(page, limit, total),
    });
});

router.get('/:username', validate({ params: schemas.users.params }), async (req, res) => {
    const user = await findUserByName(req.valid.params.username);
    const { password, email, ...profile } = user.toObject(); // eslint-disable-line no-unused-vars

    res.json({ ...profile, stats: await getUserStats(user._id) });
});

router.get(
    '/:username/reviews',
    validate({ params: schemas.users.params, query: schemas.users.reviewsQuery }),
    async (req, res) => {
        const user = await findUserByName(req.valid.params.username);
        const { page, limit } = req.valid.query;

        const [reviews, total] = await Promise.all([
            Review.find({ user: user._id })
                .populate('game', 'title coverImage slug igdbId')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Review.countDocuments({ user: user._id }),
        ]);

        res.json({
            reviews: reviews.map((r) => ({ ...r, likesCount: r.likes?.length || 0 })),
            pagination: pagination(page, limit, total),
        });
    },
);

router.get('/:username/lists', validate({ params: schemas.users.params }), async (req, res) => {
    const user = await findUserByName(req.valid.params.username);

    const lists = await List.find({ user: user._id }).populate('games', 'title coverImage').sort({ createdAt: -1 });

    res.json(
        lists.map((list) => ({
            _id: list._id,
            name: list.name,
            description: list.description,
            gameCount: list.games.length,
            previewGames: list.games.slice(0, 4).map((g) => ({ title: g.title, coverImage: g.coverImage })),
            createdAt: list.createdAt,
        })),
    );
});

export default router;
