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
    averageRating: 0, // Default to 0 (ignore RAWG rating), strictly use local Move data
    genre: data.genres?.map(g => g.name) || [],
    platforms: data.platforms?.map(p => p.platform.name) || [],
    isRemote: true // Flag to tell frontend this is from RAWG
});

// Search/Browse Games (Proxy to RAWG)
router.get('/', async (req, res) => {
    try {
        const { search, ordering, dates, platforms, genres, page } = req.query;
        const RAWG_API_KEY = process.env.RAWG_API_KEY;

        // Simple platform mapping to RAWG IDs (mock list -> real IDs)
        // PC: 4, PlayStation 5: 187, PlayStation 4: 18, Xbox One: 1, Xbox Series S/X: 186, Nintendo Switch: 7
        // For simplicity, we'll map broad terms to a few primary IDs
        const platformMap = {
            'pc': '4',
            'playstation': '187,18',
            'xbox': '1,186',
            'nintendo': '7',
            'ios': '3',
            'android': '21'
        };

        const genreMap = {
            'rpg': 'role-playing-games-rpg',
            'action': 'action',
            'adventure': 'adventure',
            'shooter': 'shooter',
            'strategy': 'strategy',
            'roguelike': 'tag:roguelike' // Handle as tag
        };

        let rawgPlatforms = platforms;
        if (platforms && platformMap[platforms.toLowerCase()]) {
            rawgPlatforms = platformMap[platforms.toLowerCase()];
        }

        let rawgGenres = genres;
        let rawgTags = undefined;

        if (genres) {
            const lowerGenre = genres.toLowerCase();
            if (genreMap[lowerGenre]) {
                const mapped = genreMap[lowerGenre];
                // Check if mapped value implies it's a tag (custom logic or simple check)
                if (mapped === 'tag:roguelike') {
                    rawgTags = 'roguelike';
                    rawgGenres = undefined;
                } else {
                    rawgGenres = mapped;
                }
            } else {
                rawgGenres = lowerGenre;
            }
        }

        const params = {
            key: RAWG_API_KEY,
            page_size: 20,
            page: page || 1,
            search: search,
            ordering: ordering || '-added',
            dates: dates,
            platforms: rawgPlatforms,
            genres: rawgGenres,
            tags: rawgTags
        };

        const response = await axios.get(`${RAWG_BASE_URL}/games`, { params });

        const rawgGames = response.data.results;

        // Get RAWG IDs to check against local DB
        const rawgIds = rawgGames.map(g => g.id);
        const localGames = await Game.find({ rawgId: { $in: rawgIds } });

        // Create map for faster lookup: rawgId -> localGame
        const localGameMap = {};
        localGames.forEach(g => {
            localGameMap[g.rawgId] = g;
        });

        const games = rawgGames.map(g => {
            const mapped = mapRawgGame(g);
            // Override rating with local data if exists, else 0 (unrated on Hitbox)
            if (localGameMap[g.id]) {
                mapped.averageRating = localGameMap[g.id].averageRating || 0;
            } else {
                mapped.averageRating = 0;
            }
            return mapped;
        });

        res.json({
            results: games,
            count: response.data.count,
            next: response.data.next ? true : false,
            previous: response.data.previous ? true : false
        });
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
