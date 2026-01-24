import express from 'express';
import Game from '../models/Game.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [games, reviews, lists, members] = await Promise.all([
            Game.countDocuments(),
            Review.countDocuments(),
            List.countDocuments(),
            User.countDocuments()
        ]);

        res.json({ games, reviews, lists, members });
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
