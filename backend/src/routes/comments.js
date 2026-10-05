import express from 'express';
import Comment from '../models/Comment.js';
import List from '../models/List.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { HttpError, notFound } from '../lib/errors.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

const assertListExists = async (listId) => {
    if (!(await List.exists({ _id: listId }))) throw notFound('List not found');
};

router.get('/list/:listId', validate({ params: schemas.comments.listParams }), async (req, res) => {
    const { listId } = req.valid.params;
    await assertListExists(listId);

    const comments = await Comment.find({ list: listId })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 });

    res.json(comments);
});

router.post(
    '/list/:listId',
    auth,
    validate({ params: schemas.comments.listParams, body: schemas.comments.create }),
    async (req, res) => {
        const { listId } = req.valid.params;
        await assertListExists(listId);

        const comment = await Comment.create({ user: req.user.id, list: listId, text: req.valid.body.text });
        await comment.populate('user', 'username profilePicture');

        res.status(201).json(comment);
    },
);

router.delete('/:commentId', auth, validate({ params: schemas.comments.params }), async (req, res) => {
    const comment = await Comment.findById(req.valid.params.commentId);
    if (!comment) throw notFound('Comment not found');
    if (comment.user.toString() !== req.user.id) throw new HttpError(403, 'Unauthorized');

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
});

export default router;
