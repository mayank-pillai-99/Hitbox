import express from 'express';
import igdb from '../utils/igdb.js';
import Review from '../models/Review.js';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';
import { mapIGDBGame } from '../utils/mappers.js';

const router = express.Router();

// Add a review
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, rating, text } = req.body;
        let targetGameId = gameId;

        // Check if gameId is a valid ObjectId (Internal DB)
        if (!String(gameId).match(/^[0-9a-fA-F]{24}$/)) {
            // It's likely an IGDB ID (numeric).
            const igdbId = parseInt(gameId);

            if (!isNaN(igdbId)) {
                // Check if we have it in DB
                let game = await Game.findOne({ igdbId: igdbId });

                if (!game) {
                    // Not in DB, fetch from IGDB and create it
                    try {
                        // We need to fetch detailed info to save it
                        const query = `
                            fields name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug, involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
                            where id = ${igdbId};
                        `;
                        const response = await igdb.post('/games', query);

                        if (response.data && response.data.length > 0) {
                            const params = mapIGDBGame(response.data[0]);

                            // mapIGDBGame returns an object suitable for response, but for Mongoose we need to be explicit or pass proper object
                            // _id should NOT be set manually for Mongoose if we want auto ObjectId, 
                            // BUT our previous design used External IDs as _id sometimes? 
                            // Wait, 'games.js' line 100: games = rawgGames.map(g => ... _id: data.id)
                            // This was for frontend display. The DB Schema has _id as ObjectId by default unless overwritten.
                            // In 'mapRawgGame' (old): _id: data.id.
                            // In 'reviews.js' (old): rawgId: data.id... it didn't set _id manually.

                            const newGame = new Game({
                                igdbId: params.igdbId,
                                title: params.title,
                                slug: params.slug,
                                description: params.description,
                                coverImage: params.coverImage,
                                releaseDate: params.releaseDate,
                                averageRating: 0, // Reset rating for new local entry
                                genre: params.genre,
                                platforms: params.platforms,
                                developer: params.developer,
                                publisher: params.publisher
                            });

                            game = await newGame.save();
                        } else {
                            return res.status(404).json({ message: 'Game not found on IGDB' });
                        }
                    } catch (fetchErr) {
                        console.error("Failed to fetch/save IGDB game:", fetchErr.message);
                        return res.status(404).json({ message: 'Game not found' });
                    }
                }
                targetGameId = game._id;
            } else {
                return res.status(400).json({ message: 'Invalid Game ID' });
            }
        }

        const newReview = new Review({
            user: req.user.id,
            game: targetGameId,
            rating,
            text,
        });

        const review = await newReview.save();

        // Calculate new average rating
        const stats = await Review.aggregate([
            { $match: { game: targetGameId } },
            { $group: { _id: '$game', averageRating: { $avg: '$rating' } } }
        ]);

        // Update game with new average
        if (stats.length > 0) {
            await Game.findByIdAndUpdate(targetGameId, { averageRating: stats[0].averageRating });
        }

        res.json(review);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this game' });
        }
        res.status(500).send('Server error');
    }
});

// Get recent reviews (public - for homepage)
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const reviews = await Review.find()
            .populate('game', 'title coverImage slug igdbId')
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Add likesCount to each review
        const reviewsWithLikes = reviews.map(review => ({
            ...review,
            likesCount: review.likes?.length || 0
        }));

        res.json(reviewsWithLikes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get current user's reviews
router.get('/my', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('game', 'title coverImage slug igdbId')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Add likesCount to each review
        const reviewsWithLikes = reviews.map(review => ({
            ...review,
            likesCount: review.likes?.length || 0
        }));

        res.json(reviewsWithLikes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get reviews for a game
router.get('/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        let queryGameId = gameId;

        // Validating if it's a MongoDB ID
        if (!String(gameId).match(/^[0-9a-fA-F]{24}$/)) {
            // It's an IGDB ID. Find the internal Game _id
            const igdbId = parseInt(gameId);
            if (!isNaN(igdbId)) {
                const game = await Game.findOne({ igdbId });
                if (!game) {
                    // Game doesn't exist in DB yet, so validly, there are NO reviews.
                    return res.json([]);
                }
                queryGameId = game._id;
            }
        }

        const reviews = await Review.find({ game: queryGameId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .lean();

        // Add likesCount to each review
        const reviewsWithLikes = reviews.map(review => ({
            ...review,
            likesCount: review.likes?.length || 0
        }));

        res.json(reviewsWithLikes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, text } = req.body;

        // Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this review' });
        }

        // Update fields
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            review.rating = rating;
        }
        if (text !== undefined) {
            review.text = text;
        }

        await review.save();

        // Recalculate game average rating
        const gameReviews = await Review.find({ game: review.game });
        if (gameReviews.length > 0) {
            const avgRating = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
            await Game.findByIdAndUpdate(review.game, { averageRating: Math.round(avgRating * 10) / 10 });
        }

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const gameId = review.game;

        await Review.findByIdAndDelete(reviewId);

        // Recalculate game average rating
        const gameReviews = await Review.find({ game: gameId });
        if (gameReviews.length > 0) {
            const avgRating = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
            await Game.findByIdAndUpdate(gameId, { averageRating: Math.round(avgRating * 10) / 10 });
        } else {
            await Game.findByIdAndUpdate(gameId, { averageRating: 0 });
        }

        res.json({ message: 'Review deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Like a review
router.post('/:reviewId/like', auth, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if already liked
        if (review.likes.includes(userId)) {
            return res.status(400).json({ message: 'Already liked this review' });
        }

        review.likes.push(userId);
        await review.save();

        res.json({
            message: 'Review liked',
            likesCount: review.likes.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Unlike a review
router.delete('/:reviewId/like', auth, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if not liked
        if (!review.likes.includes(userId)) {
            return res.status(400).json({ message: 'Not liked this review' });
        }

        review.likes = review.likes.filter(id => id.toString() !== userId);
        await review.save();

        res.json({
            message: 'Review unliked',
            likesCount: review.likes.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
