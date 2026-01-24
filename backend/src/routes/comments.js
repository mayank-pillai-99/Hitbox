import express from 'express';
import Comment from '../models/Comment.js';
import List from '../models/List.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get list comments
router.get('/list/:listId', async (req, res) => {
    try {
        if (!await List.exists({ _id: req.params.listId })) {
            return res.status(404).json({ message: 'List not found' });
        }

        const comments = await Comment.find({ list: req.params.listId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Add comment
router.post('/list/:listId', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ message: 'Comment required' });
        if (text.length > 1000) return res.status(400).json({ message: 'Too long' });

        if (!await List.exists({ _id: req.params.listId })) {
            return res.status(404).json({ message: 'List not found' });
        }

        const comment = await new Comment({
            user: req.user.id,
            list: req.params.listId,
            text: text.trim()
        }).save();

        await comment.populate('user', 'username profilePicture');
        res.status(201).json(comment);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete comment
router.delete('/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
