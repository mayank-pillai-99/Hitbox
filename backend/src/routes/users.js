import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Review from '../models/Review.js';
import List from '../models/List.js';

const router = express.Router();

// Get all members (for Members page)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'reviews'; // 'reviews', 'recent', 'lists'

        // Get all users
        const users = await User.find()
            .select('-password -email')
            .skip(skip)
            .limit(limit)
            .lean();

        // Fetch stats and recent reviews for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const reviewsCount = await Review.countDocuments({ user: user._id });
            const listsCount = await List.countDocuments({ user: user._id });

            // Get recent reviews with game covers
            const recentReviews = await Review.find({ user: user._id })
                .populate('game', 'title coverImage')
                .sort({ createdAt: -1 })
                .limit(4)
                .lean();

            const recentGames = recentReviews
                .filter(r => r.game && r.game.coverImage)
                .map(r => ({
                    title: r.game.title,
                    coverImage: r.game.coverImage
                }));

            return {
                _id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt,
                stats: {
                    reviews: reviewsCount,
                    lists: listsCount,
                    gamesPlayed: 0
                },
                recentGames
            };
        }));

        // Sort by reviews count (most active first)
        if (sort === 'reviews') {
            usersWithStats.sort((a, b) => b.stats.reviews - a.stats.reviews);
        } else if (sort === 'recent') {
            usersWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const total = await User.countDocuments();

        res.json({
            members: usersWithStats,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get public user profile by username
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate stats
        const reviewsCount = await Review.countDocuments({ user: user._id });
        const listsCount = await List.countDocuments({ user: user._id });

        res.json({
            _id: user._id,
            username: user.username,
            bio: user.bio,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            stats: {
                reviews: reviewsCount,
                lists: listsCount,
                gamesPlayed: 0 // Placeholder until we implement game status tracking
            }
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).send('Server error');
    }
});

// Get user's reviews
router.get('/:username/reviews', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: user._id })
            .populate('game', 'title coverImage slug igdbId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ user: user._id });

        res.json({
            reviews,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user's lists
router.get('/:username/lists', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const lists = await List.find({ user: user._id })
            .populate('games', 'title coverImage')
            .sort({ createdAt: -1 });

        // Transform to include preview info
        const listsWithPreview = lists.map(list => ({
            _id: list._id,
            name: list.name,
            description: list.description,
            gameCount: list.games.length,
            previewGames: list.games.slice(0, 4).map(g => ({
                title: g.title,
                coverImage: g.coverImage
            })),
            createdAt: list.createdAt
        }));

        res.json(listsWithPreview);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
