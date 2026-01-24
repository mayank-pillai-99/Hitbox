import express from 'express';
import GameStatus from '../models/GameStatus.js';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';
import { findOrCreateGame } from '../utils/gameService.js';

const router = express.Router();

// Get statuses
router.get('/', auth, async (req, res) => {
    try {
        const statuses = await GameStatus.find({ user: req.user.id })
            .populate('game', 'title coverImage slug igdbId releaseDate')
            .sort({ updatedAt: -1 });

        res.json({
            played: statuses.filter(s => s.status === 'played'),
            playing: statuses.filter(s => s.status === 'playing'),
            want_to_play: statuses.filter(s => s.status === 'want_to_play')
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Check status
router.get('/game/:gameId', auth, async (req, res) => {
    try {
        const { gameId } = req.params;
        let queryId = gameId;

        // Resolve IGDB ID if needed
        if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
            const game = await Game.findOne({ igdbId: parseInt(gameId) });
            if (!game) return res.json({ status: null });
            queryId = game._id;
        }

        const status = await GameStatus.findOne({ user: req.user.id, game: queryId });
        res.json({ status: status?.status || null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update status
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, status } = req.body;

        if (!['played', 'playing', 'want_to_play'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const game = await findOrCreateGame(gameId);
        if (!game) return res.status(404).json({ message: 'Game not found' });

        const result = await GameStatus.findOneAndUpdate(
            { user: req.user.id, game: game._id },
            { status },
            { upsert: true, new: true }
        );

        res.json({ status: result.status, game: game._id });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Remove status
router.delete('/:gameId', auth, async (req, res) => {
    try {
        const { gameId } = req.params;
        let queryId = gameId;

        if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
            const game = await Game.findOne({ igdbId: parseInt(gameId) });
            if (!game) return res.status(404).json({ message: 'Game not found' });
            queryId = game._id;
        }

        await GameStatus.findOneAndDelete({ user: req.user.id, game: queryId });
        res.json({ message: 'Status removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Stats counts
router.get('/counts', auth, async (req, res) => {
    try {
        const counts = await GameStatus.aggregate([
            { $match: { user: new GameStatus.base.mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const acc = { played: 0, playing: 0, want_to_play: 0, total: 0 };
        counts.forEach(c => {
            acc[c._id] = c.count;
            acc.total += c.count;
        });

        res.json(acc);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
