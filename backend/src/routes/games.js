import express from 'express';
import axios from 'axios';
import Game from '../models/Game.js';

const router = express.Router();
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// Helper to map RAWG data to our schema shape
const mapRawgGame = (data) => ({
    _id: data.id, // Use RAWG ID as _id for frontend consistency (passed as string/number)
    rawgId: data.id,
    title: data.name,
    slug: data.slug,
    description: data.description_raw || data.description,
    coverImage: data.background_image,
    releaseDate: data.released,
    averageRating: data.rating, // RAWG rating (out of 5)
    genre: data.genres?.map(g => g.name) || [],
    platforms: data.platforms?.map(p => p.platform.name) || [],
    isRemote: true // Flag to tell frontend this is from RAWG
});

// Search/Browse Games (Proxy to RAWG)
router.get('/', async (req, res) => {
    try {
        const { search, ordering, dates, platforms } = req.query;
        const RAWG_API_KEY = process.env.RAWG_API_KEY;

        // If we have a specific search or filters, hit RAWG
        // Default to RAWG for browsing to get "popular" games
        const params = {
            key: RAWG_API_KEY,
            page_size: 20,
            search: search,
            ordering: ordering || '-added', // Default to popular
            dates: dates,
            platforms: platforms
        };

        const response = await axios.get(`${RAWG_BASE_URL}/games`, { params });

        const games = response.data.results.map(mapRawgGame);
        res.json(games);
    } catch (err) {
        console.error("RAWG API Error:", err.message);
        res.status(500).json({ message: 'Failed to fetch games' });
    }
});

// Get Game Details (Local DB -> RAWG Fallback)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let game;

        // 1. Check if ID is a standard valid ObjectId (Internal DB)
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            game = await Game.findById(id);
        } else {
            // 2. Check if it's a numeric RAWG ID stored in our DB
            game = await Game.findOne({ rawgId: id });
        }

        // 3. If found in DB, return it (reviews handled separately)
        if (game) {
            return res.json(game);
        }

        // 4. Not in DB, fetch from RAWG
        try {
            const RAWG_API_KEY = process.env.RAWG_API_KEY;
            const rawgRes = await axios.get(`${RAWG_BASE_URL}/games/${id}`, {
                params: { key: RAWG_API_KEY }
            });
            game = mapRawgGame(rawgRes.data);
            res.json(game);
        } catch (apiErr) {
            if (apiErr.response && apiErr.response.status === 404) {
                return res.status(404).json({ message: 'Game not found' });
            }
            throw apiErr;
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
