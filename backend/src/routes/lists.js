import express from 'express';
import List from '../models/List.js';
import Game from '../models/Game.js';
import Comment from '../models/Comment.js';
import auth from '../middleware/auth.js';
import { findOrCreateGame } from '../utils/gameService.js';

const router = express.Router();

// Public Discovery
router.get('/discover', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'popular';

        const lists = await List.find()
            .populate('games', 'title coverImage')
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const previews = await Promise.all(lists.map(async (list) => {
            const commentCount = await Comment.countDocuments({ list: list._id });
            return {
                _id: list._id,
                name: list.name,
                description: list.description,
                gameCount: list.games.length,
                commentCount,
                previewGames: list.games.slice(0, 5).map(g => ({ title: g.title, coverImage: g.coverImage })),
                user: {
                    username: list.user?.username || 'Unknown',
                    profilePicture: list.user?.profilePicture
                },
                createdAt: list.createdAt
            };
        }));

        if (sort === 'popular') previews.sort((a, b) => b.gameCount - a.gameCount);

        const total = await List.countDocuments();

        res.json({
            lists: previews,
            pagination: { current: page, total: Math.ceil(total / limit), count: total }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// User's Lists
router.get('/', auth, async (req, res) => {
    try {
        const lists = await List.find({ user: req.user.id }).populate('games');
        res.json(lists);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create List
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const list = await new List({ user: req.user.id, name, description, isCustom: true }).save();
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Add Game to List
router.post('/:id/add', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        const list = await List.findOne({ _id: req.params.id, user: req.user.id });

        if (!list) return res.status(404).json({ message: 'List not found' });

        const game = await findOrCreateGame(gameId);
        if (!game) return res.status(404).json({ message: 'Game not found' });

        if (list.games.includes(game._id)) {
            return res.status(400).json({ message: 'Game already in list' });
        }

        list.games.push(game._id);
        await list.save();
        res.json(list);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
            .populate('games')
            .populate('user', 'username profilePicture');
        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const list = await List.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: { name, description } },
            { new: true }
        );
        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const list = await List.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json({ message: 'List removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id/game/:gameId', auth, async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.id, user: req.user.id });
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.games = list.games.filter(g => g.toString() !== req.params.gameId);
        await list.save();

        const populated = await List.findById(list._id).populate('games').populate('user');
        res.json(populated);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
