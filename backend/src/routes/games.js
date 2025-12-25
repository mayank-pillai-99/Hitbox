import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.json(games);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get game by ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: 'Game not found' });
        res.json(game);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Game not found' });
        res.status(500).send('Server error');
    }
});

// Add a new game (Admin/Seed)
router.post('/', async (req, res) => {
    try {
        const newGame = new Game(req.body);
        const game = await newGame.save();
        res.json(game);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
