import express from 'express';
import GameStatus from '../models/GameStatus.js';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';
import igdb from '../utils/igdb.js';
import { mapIGDBGame } from '../utils/mappers.js';

const router = express.Router();

// Get current user's game statuses
router.get('/', auth, async (req, res) => {
    try {
        const statuses = await GameStatus.find({ user: req.user.id })
            .populate('game', 'title coverImage slug igdbId releaseDate')
            .sort({ updatedAt: -1 });

        // Group by status
        const grouped = {
            played: statuses.filter(s => s.status === 'played'),
            playing: statuses.filter(s => s.status === 'playing'),
            want_to_play: statuses.filter(s => s.status === 'want_to_play')
        };

        res.json(grouped);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get status for a specific game
router.get('/game/:gameId', auth, async (req, res) => {
    try {
        const { gameId } = req.params;

        // Find game by ID or igdbId
        let game;
        if (gameId.match(/^[0-9a-fA-F]{24}$/)) {
            game = await Game.findById(gameId);
        }
        if (!game) {
            game = await Game.findOne({ igdbId: parseInt(gameId) });
        }

        if (!game) {
            return res.json({ status: null });
        }

        const status = await GameStatus.findOne({
            user: req.user.id,
            game: game._id
        });

        res.json({ status: status?.status || null });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Set or update game status
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, status } = req.body;

        if (!gameId || !status) {
            return res.status(400).json({ message: 'gameId and status are required' });
        }

        if (!['played', 'playing', 'want_to_play'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find or create game in local DB
        let game;
        if (gameId.match && gameId.match(/^[0-9a-fA-F]{24}$/)) {
            game = await Game.findById(gameId);
        }

        if (!game) {
            // Check if it's an IGDB ID
            const numericId = parseInt(gameId);
            if (!isNaN(numericId)) {
                game = await Game.findOne({ igdbId: numericId });

                if (!game) {
                    // Fetch from IGDB and save
                    try {
                        const query = `
                            fields name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug;
                            where id = ${numericId};
                        `;
                        const igdbRes = await igdb.post('/games', query);

                        if (igdbRes.data && igdbRes.data.length > 0) {
                            const mapped = mapIGDBGame(igdbRes.data[0]);
                            game = new Game({
                                igdbId: mapped.igdbId,
                                title: mapped.title,
                                slug: mapped.slug,
                                description: mapped.description,
                                coverImage: mapped.coverImage,
                                releaseDate: mapped.releaseDate,
                                genre: mapped.genre,
                                platforms: mapped.platforms,
                                averageRating: 0
                            });
                            await game.save();
                        }
                    } catch (fetchErr) {
                        console.error("Failed to fetch game from IGDB:", fetchErr.message);
                    }
                }
            }
        }

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Upsert the status
        const gameStatus = await GameStatus.findOneAndUpdate(
            { user: req.user.id, game: game._id },
            { status },
            { upsert: true, new: true }
        );

        res.json({ status: gameStatus.status, game: game._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Remove game status
router.delete('/:gameId', auth, async (req, res) => {
    try {
        const { gameId } = req.params;

        let game;
        if (gameId.match(/^[0-9a-fA-F]{24}$/)) {
            game = await Game.findById(gameId);
        }
        if (!game) {
            game = await Game.findOne({ igdbId: parseInt(gameId) });
        }

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        await GameStatus.findOneAndDelete({ user: req.user.id, game: game._id });

        res.json({ message: 'Status removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user's game counts (for profile stats)
router.get('/counts', auth, async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const userId = new mongoose.default.Types.ObjectId(req.user.id);

        const counts = await GameStatus.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const result = {
            played: 0,
            playing: 0,
            want_to_play: 0,
            total: 0
        };

        counts.forEach(c => {
            result[c._id] = c.count;
            result.total += c.count;
        });

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
