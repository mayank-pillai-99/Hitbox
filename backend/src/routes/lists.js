import express from 'express';
import List from '../models/List.js';
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

        // Check if game already in list
        if (list.games.includes(gameId)) {
            return res.status(400).json({ message: 'Game already in list' });
        }

        list.games.push(gameId);
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
