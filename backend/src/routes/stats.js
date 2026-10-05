import express from 'express';
import Game from '../models/Game.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (_req, res) => {
    const [games, reviews, lists, members] = await Promise.all([
        Game.countDocuments(),
        Review.countDocuments(),
        List.countDocuments(),
        User.countDocuments(),
    ]);

    res.json({ games, reviews, lists, members });
});

export default router;
