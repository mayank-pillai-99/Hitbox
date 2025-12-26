import express from 'express';
import axios from 'axios';
import Review from '../models/Review.js';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// Add a review
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, rating, text } = req.body;
        const RAWG_API_KEY = process.env.RAWG_API_KEY;
        let targetGameId = gameId;

        // Check if gameId is numeric (RAWG ID) and not an ObjectId
        if (!String(gameId).match(/^[0-9a-fA-F]{24}$/)) {
            // It's likely a RAWG ID. Check if we have it in DB.
            let game = await Game.findOne({ rawgId: gameId });

            if (!game) {
                // Not in DB, fetch from RAWG and create it
                try {
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
                    return res.status(404).json({ message: 'Game not found' });
                }
            }
            targetGameId = game._id;
        }

        const newReview = new Review({
            user: req.user.id,
            game: targetGameId,
            rating,
            text,
        });

        const review = await newReview.save();
        res.json(review);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this game' });
        }
        res.status(500).send('Server error');
    }
});

// Get reviews for a game
router.get('/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        let queryGameId = gameId;

        // Validating if it's a RAWG ID (numeric) or Mongo ID
        if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a RAWG ID. Find the internal Game _id
            const game = await Game.findOne({ rawgId: gameId });
            if (!game) {
                // Game doesn't exist in DB yet, so validly, there are NO reviews.
                return res.json([]);
            }
            queryGameId = game._id;
        }

        const reviews = await Review.find({ game: queryGameId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
