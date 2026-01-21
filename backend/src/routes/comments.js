import express from 'express';
import Comment from '../models/Comment.js';
import List from '../models/List.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all comments for a list
router.get('/list/:listId', async (req, res) => {
    try {
        const { listId } = req.params;

        // Verify list exists
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const comments = await Comment.find({ list: listId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add comment to a list
router.post('/list/:listId', auth, async (req, res) => {
    try {
        const { listId } = req.params;
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        if (text.length > 1000) {
            return res.status(400).json({ message: 'Comment must be under 1000 characters' });
        }

        // Verify list exists
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const comment = new Comment({
            user: req.user.id,
            list: listId,
            text: text.trim()
        });

        await comment.save();

        // Populate user info for response
        await comment.populate('user', 'username profilePicture');

        res.status(201).json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a comment (only by owner)
router.delete('/:commentId', auth, async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);

        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
