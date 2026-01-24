import express from 'express';
import Game from '../models/Game.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import User from '../models/User.js';

const router = express.Router();

// Get global stats
router.get('/', async (req, res) => {
    try {
        const [gamesCount, reviewsCount, listsCount, usersCount] = await Promise.all([
            Game.countDocuments(),
            Review.countDocuments(),
            List.countDocuments(),
            User.countDocuments()
        ]);

        res.json({
            games: gamesCount,
            reviews: reviewsCount,
            lists: listsCount,
            members: usersCount
        });
    } catch (err) {
        console.error('Error fetching stats:', err.message);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

export default router;
