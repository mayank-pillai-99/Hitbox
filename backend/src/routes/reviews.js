import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Add a review
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, rating, text } = req.body;

        const newReview = new Review({
            user: req.user.id,
            game: gameId,
            rating,
            text,
        });

        const review = await newReview.save();
        res.json(review);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this game' });
        }
        res.status(500).send('Server error');
    }
});

// Get reviews for a game
router.get('/game/:gameId', async (req, res) => {
    try {
        const reviews = await Review.find({ game: req.params.gameId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
