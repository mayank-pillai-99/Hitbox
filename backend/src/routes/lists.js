import express from 'express';
import axios from 'axios';
import List from '../models/List.js';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get current user's lists
router.get('/', auth, async (req, res) => {
    try {
        const lists = await List.find({ user: req.user.id }).populate('games');
        res.json(lists);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create a new list
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;

        const newList = new List({
            user: req.user.id,
            name,
            description,
            isCustom: true,
        });

        const list = await newList.save();
        res.json(list);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add game to list
router.post('/:id/add', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) return res.status(404).json({ message: 'List not found' });
        if (list.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let targetGameId = gameId;

        // Check if gameId is numeric (RAWG ID) and not an ObjectId
        if (!String(gameId).match(/^[0-9a-fA-F]{24}$/)) {
            // It's likely a RAWG ID. Check if we have it in DB.
            let game = await Game.findOne({ rawgId: gameId });

            if (!game) {
                // Not in DB, fetch from RAWG and create it
                try {
                    const RAWG_API_KEY = process.env.RAWG_API_KEY;
                    const RAWG_BASE_URL = 'https://api.rawg.io/api';
                    const rawgRes = await axios.get(`${RAWG_BASE_URL}/games/${gameId}`, {
                        params: { key: RAWG_API_KEY }
                    });

                    const data = rawgRes.data;
                    const newGame = new Game({
                        rawgId: data.id,
                        title: data.name,
                        slug: data.slug,
                        description: data.description_raw || data.description,
                        coverImage: data.background_image,
                        releaseDate: data.released,
                        averageRating: data.rating,
                        genre: data.genres?.map(g => g.name) || [],
                        platforms: data.platforms?.map(p => p.platform.name) || [],
                        developer: data.developers?.[0]?.name,
                        publisher: data.publishers?.[0]?.name,
                    });

                    game = await newGame.save();
                } catch (fetchErr) {
                    console.error("Failed to fetch/save RAWG game:", fetchErr.message);
                    return res.status(404).json({ message: 'Game not found on RAWG' });
                }
            }
            targetGameId = game._id;
        }

        // Check if game already in list
        if (list.games.includes(targetGameId)) {
            return res.status(400).json({ message: 'Game already in list' });
        }

        list.games.push(targetGameId);
        await list.save();

        res.json(list);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get a specific list by ID
router.get('/:id', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
            .populate('games')
            .populate('user', 'username profilePicture');

        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'List not found' });
        res.status(500).send('Server error');
    }
});

export default router;
