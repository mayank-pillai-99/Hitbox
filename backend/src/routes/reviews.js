import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { conflict, notFound } from '../lib/errors.js';
import { findOrCreateGame, resolveLocalGameId, updateGameRating } from '../services/game.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

const withLikesCount = (reviews) => reviews.map((r) => ({ ...r, likesCount: r.likes?.length || 0 }));

router.post('/', auth, validate({ body: schemas.reviews.create }), async (req, res) => {
    const { gameId, rating, text } = req.valid.body;

    const game = await findOrCreateGame(gameId);
    if (!game) throw notFound('Game not found');

    let review;
    try {
        review = await Review.create({ user: req.user.id, game: game._id, rating, text });
    } catch (err) {
        if (err.code === 11000) throw conflict('Already reviewed');
        throw err;
    }

    await updateGameRating(game._id);
    res.json(review);
});

router.get('/recent', validate({ query: schemas.reviews.recentQuery }), async (req, res) => {
    const reviews = await Review.find()
        .populate('game', 'title coverImage slug igdbId')
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 })
        .limit(req.valid.query.limit)
        .lean();

    res.json(withLikesCount(reviews));
});

router.get('/my', auth, async (req, res) => {
    const reviews = await Review.find({ user: req.user.id })
        .populate('game', 'title coverImage slug igdbId')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    res.json(withLikesCount(reviews));
});

router.get('/game/:gameId', validate({ params: schemas.reviews.gameParams }), async (req, res) => {
    // A game that isn't saved locally has no reviews yet.
    const gameId = await resolveLocalGameId(req.valid.params.gameId);
    if (!gameId) return res.json([]);

    const reviews = await Review.find({ game: gameId })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 })
        .lean();

    res.json(withLikesCount(reviews));
});

router.put(
    '/:reviewId',
    auth,
    validate({ params: schemas.reviews.params, body: schemas.reviews.update }),
    async (req, res) => {
        const { rating, text } = req.valid.body;
        const review = await Review.findOne({ _id: req.valid.params.reviewId, user: req.user.id });
        if (!review) throw notFound('Review not found');

        if (rating !== undefined) review.rating = rating;
        if (text !== undefined) review.text = text;
        await review.save();
        await updateGameRating(review.game);

        res.json(review);
    },
);

router.delete('/:reviewId', auth, validate({ params: schemas.reviews.params }), async (req, res) => {
    const review = await Review.findOneAndDelete({ _id: req.valid.params.reviewId, user: req.user.id });
    if (!review) throw notFound('Review not found');

    await updateGameRating(review.game);
    res.json({ message: 'Review deleted' });
});

// $addToSet / $pull are atomic, so simultaneous likes can't overwrite each other.
router.post('/:reviewId/like', auth, validate({ params: schemas.reviews.params }), async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.valid.params.reviewId,
        { $addToSet: { likes: req.user.id } },
        { new: true },
    );
    if (!review) throw notFound('Review not found');

    res.json({ message: 'Liked', likesCount: review.likes.length });
});

router.delete('/:reviewId/like', auth, validate({ params: schemas.reviews.params }), async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.valid.params.reviewId,
        { $pull: { likes: req.user.id } },
        { new: true },
    );
    if (!review) throw notFound('Review not found');

    res.json({ message: 'Unliked', likesCount: review.likes.length });
});

export default router;
