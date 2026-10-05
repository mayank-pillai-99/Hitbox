import express from 'express';
import GameStatus from '../models/GameStatus.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { notFound } from '../lib/errors.js';
import { findOrCreateGame, resolveLocalGameId } from '../services/game.service.js';
import { toObjectId } from '../services/stats.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
    const statuses = await GameStatus.find({ user: req.user.id })
        .populate('game', 'title coverImage slug igdbId releaseDate')
        .sort({ updatedAt: -1 });

    res.json({
        played: statuses.filter((s) => s.status === 'played'),
        playing: statuses.filter((s) => s.status === 'playing'),
        want_to_play: statuses.filter((s) => s.status === 'want_to_play'),
    });
});

// Registered before /game/:gameId and /:gameId so "counts" isn't read as a game id.
router.get('/counts', auth, async (req, res) => {
    const counts = await GameStatus.aggregate([
        { $match: { user: toObjectId(req.user.id) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = { played: 0, playing: 0, want_to_play: 0, total: 0 };
    for (const { _id, count } of counts) {
        result[_id] = count;
        result.total += count;
    }

    res.json(result);
});

router.get('/game/:gameId', auth, validate({ params: schemas.gameStatus.params }), async (req, res) => {
    const gameId = await resolveLocalGameId(req.valid.params.gameId);
    if (!gameId) return res.json({ status: null });

    const status = await GameStatus.findOne({ user: req.user.id, game: gameId });
    res.json({ status: status?.status || null });
});

router.post('/', auth, validate({ body: schemas.gameStatus.set }), async (req, res) => {
    const { gameId, status } = req.valid.body;

    const game = await findOrCreateGame(gameId);
    if (!game) throw notFound('Game not found');

    const result = await GameStatus.findOneAndUpdate(
        { user: req.user.id, game: game._id },
        { status },
        { upsert: true, new: true },
    );

    res.json({ status: result.status, game: game._id });
});

router.delete('/:gameId', auth, validate({ params: schemas.gameStatus.params }), async (req, res) => {
    const gameId = await resolveLocalGameId(req.valid.params.gameId);
    if (!gameId) throw notFound('Game not found');

    await GameStatus.findOneAndDelete({ user: req.user.id, game: gameId });
    res.json({ message: 'Status removed' });
});

export default router;
