import express from 'express';
import Review from '../models/Review.js';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';
import { findOrCreateGame } from '../utils/gameService.js';

const router = express.Router();

// Helper to update game stats
const updateGameRating = async (gameId) => {
    const stats = await Review.aggregate([
        { $match: { game: gameId } },
        { $group: { _id: '$game', averageRating: { $avg: '$rating' } } }
    ]);
    const rating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
    await Game.findByIdAndUpdate(gameId, { averageRating: rating });
};

// Add Review
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, rating, text } = req.body;

        const game = await findOrCreateGame(gameId);
        if (!game) return res.status(404).json({ message: 'Game not found' });

        const review = await new Review({
            user: req.user.id,
            game: game._id,
            rating,
            text
        }).save();

        await updateGameRating(game._id);
        res.json(review);

    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Already reviewed' });
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Recent Reviews (Public)
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const reviews = await Review.find()
            .populate('game', 'title coverImage slug igdbId')
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json(reviews.map(r => ({ ...r, likesCount: r.likes?.length || 0 })));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// My Reviews
router.get('/my', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('game', 'title coverImage slug igdbId')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.json(reviews.map(r => ({ ...r, likesCount: r.likes?.length || 0 })));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Game Reviews
router.get('/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        let queryId = gameId;

        // If IGDB ID, resolve to local _id
        if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
            const game = await Game.findOne({ igdbId: parseInt(gameId) });
            // If checking reviews for a game that doesn't exist locally => no reviews
            if (!game) return res.json([]);
            queryId = game._id;
        }

        const reviews = await Review.find({ game: queryId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .lean();

        res.json(reviews.map(r => ({ ...r, likesCount: r.likes?.length || 0 })));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update Review
router.put('/:reviewId', auth, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const review = await Review.findOne({ _id: req.params.reviewId, user: req.user.id });

        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (rating) review.rating = rating;
        if (text !== undefined) review.text = text;

        await review.save();
        await updateGameRating(review.game);

        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete Review
router.delete('/:reviewId', auth, async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.reviewId, user: req.user.id });
        if (!review) return res.status(404).json({ message: 'Review not found' });

        await updateGameRating(review.game);
        res.json({ message: 'Review deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Like/Unlike
router.post('/:reviewId/like', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (!review.likes.includes(req.user.id)) {
            review.likes.push(req.user.id);
            await review.save();
        }
        res.json({ message: 'Liked', likesCount: review.likes.length });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:reviewId/like', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.likes = review.likes.filter(id => id.toString() !== req.user.id);
        await review.save();
        res.json({ message: 'Unliked', likesCount: review.likes.length });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
