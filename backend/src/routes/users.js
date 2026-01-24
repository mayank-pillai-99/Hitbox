import express from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';

const router = express.Router();

// Members List
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'reviews';

        const sortStage = sort === 'recent' ? { createdAt: -1 } : { reviewsCount: -1 };

        const usersWithCounts = await User.aggregate([
            { $lookup: { from: 'reviews', localField: '_id', foreignField: 'user', as: 'userReviews' } },
            { $lookup: { from: 'lists', localField: '_id', foreignField: 'user', as: 'userLists' } },
            { $addFields: { reviewsCount: { $size: '$userReviews' }, listsCount: { $size: '$userLists' } } },
            { $project: { password: 0, email: 0, userReviews: 0, userLists: 0 } },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit }
        ]);

        const members = await Promise.all(usersWithCounts.map(async (user) => {
            const recent = await Review.find({ user: user._id })
                .populate('game', 'title coverImage')
                .sort({ createdAt: -1 }).limit(4).lean();

            return {
                ...user,
                stats: { reviews: user.reviewsCount, lists: user.listsCount, gamesPlayed: 0 },
                recentGames: recent.filter(r => r.game).map(r => ({ title: r.game.title, coverImage: r.game.coverImage }))
            };
        }));

        const total = await User.countDocuments();

        res.json({
            members,
            pagination: { current: page, total: Math.ceil(total / limit), count: total }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// User Profile (Public)
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [reviews, lists] = await Promise.all([
            Review.countDocuments({ user: user._id }),
            import('../models/List.js').then(m => m.default.countDocuments({ user: user._id }))
        ]);

        res.json({
            ...user.toObject(),
            stats: { reviews, lists, gamesPlayed: 0 }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// User Reviews
router.get('/:username/reviews', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const reviews = await Review.find({ user: user._id })
            .populate('game', 'title coverImage slug igdbId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await Review.countDocuments({ user: user._id });

        res.json({
            reviews: reviews.map(r => ({ ...r, likesCount: r.likes?.length || 0 })),
            pagination: { current: page, total: Math.ceil(total / limit), count: total }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// User Lists
router.get('/:username/lists', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const ListModel = (await import('../models/List.js')).default;
        const lists = await ListModel.find({ user: user._id }).populate('games', 'title coverImage').sort({ createdAt: -1 });

        res.json(lists.map(list => ({
            _id: list._id,
            name: list.name,
            description: list.description,
            gameCount: list.games.length,
            previewGames: list.games.slice(0, 4).map(g => ({ title: g.title, coverImage: g.coverImage })),
            createdAt: list.createdAt
        })));

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
