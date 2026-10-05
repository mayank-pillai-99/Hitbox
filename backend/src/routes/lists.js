import express from 'express';
import List from '../models/List.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { conflict, notFound } from '../lib/errors.js';
import { findOrCreateGame } from '../services/game.service.js';
import { pagination } from '../services/stats.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

const PREVIEW_GAMES = 5;
const USER_FIELDS = 'username profilePicture';

const saveList = async (promise) => {
    try {
        return await promise;
    } catch (err) {
        if (err.code === 11000) throw conflict('You already have a list with that name');
        throw err;
    }
};

// Public discovery. Sorting, paging and counting happen in the database, so
// "popular" ranks every list, not just the current page.
router.get('/discover', validate({ query: schemas.lists.discoverQuery }), async (req, res) => {
    const { page, limit, sort } = req.valid.query;

    const order = sort === 'popular' ? { gameCount: -1, createdAt: -1 } : { createdAt: -1 };
    const [lists, total] = await Promise.all([
        List.aggregate([
            { $addFields: { gameCount: { $size: '$games' } } },
            { $sort: order },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    description: 1,
                    user: 1,
                    createdAt: 1,
                    gameCount: 1,
                    previewIds: { $slice: ['$games', PREVIEW_GAMES] },
                },
            },
        ]),
        List.countDocuments(),
    ]);

    const [users, games, commentCounts] = await Promise.all([
        User.find({ _id: { $in: lists.map((l) => l.user) } })
            .select(USER_FIELDS)
            .lean(),
        Game.find({ _id: { $in: lists.flatMap((l) => l.previewIds) } })
            .select('title coverImage')
            .lean(),
        Comment.aggregate([
            { $match: { list: { $in: lists.map((l) => l._id) } } },
            { $group: { _id: '$list', count: { $sum: 1 } } },
        ]),
    ]);
    const userById = new Map(users.map((u) => [String(u._id), u]));
    const gameById = new Map(games.map((g) => [String(g._id), g]));
    const commentsByList = new Map(commentCounts.map((c) => [String(c._id), c.count]));

    res.json({
        lists: lists.map((list) => {
            const owner = userById.get(String(list.user));
            return {
                _id: list._id,
                name: list.name,
                description: list.description,
                gameCount: list.gameCount,
                commentCount: commentsByList.get(String(list._id)) || 0,
                previewGames: list.previewIds
                    .map((id) => gameById.get(String(id)))
                    .filter(Boolean)
                    .map((g) => ({ title: g.title, coverImage: g.coverImage })),
                user: { username: owner?.username || 'Unknown', profilePicture: owner?.profilePicture },
                createdAt: list.createdAt,
            };
        }),
        pagination: pagination(page, limit, total),
    });
});

router.get('/', auth, async (req, res) => {
    res.json(await List.find({ user: req.user.id }).populate('games'));
});

router.post('/', auth, validate({ body: schemas.lists.create }), async (req, res) => {
    const { name, description } = req.valid.body;
    res.json(await saveList(List.create({ user: req.user.id, name, description, isCustom: true })));
});

router.post('/:id/add', auth, validate({ params: schemas.idParam, body: schemas.lists.addGame }), async (req, res) => {
    const list = await List.findOne({ _id: req.valid.params.id, user: req.user.id });
    if (!list) throw notFound('List not found');

    const game = await findOrCreateGame(req.valid.body.gameId);
    if (!game) throw notFound('Game not found');

    // Conditional update keeps two simultaneous adds from inserting the game twice.
    const updated = await List.findOneAndUpdate(
        { _id: list._id, games: { $ne: game._id } },
        { $push: { games: game._id } },
        { new: true },
    );
    if (!updated) throw conflict('Game already in list');

    res.json(updated);
});

router.get('/:id', validate({ params: schemas.idParam }), async (req, res) => {
    const list = await List.findById(req.valid.params.id).populate('games').populate('user', USER_FIELDS);
    if (!list) throw notFound('List not found');

    res.json(list);
});

router.put('/:id', auth, validate({ params: schemas.idParam, body: schemas.lists.update }), async (req, res) => {
    const { name, description } = req.valid.body;
    const update = Object.fromEntries(Object.entries({ name, description }).filter(([, v]) => v !== undefined));

    const list = await saveList(
        List.findOneAndUpdate({ _id: req.valid.params.id, user: req.user.id }, { $set: update }, { new: true }),
    );
    if (!list) throw notFound('List not found');

    res.json(list);
});

router.delete('/:id', auth, validate({ params: schemas.idParam }), async (req, res) => {
    const list = await List.findOneAndDelete({ _id: req.valid.params.id, user: req.user.id });
    if (!list) throw notFound('List not found');

    await Comment.deleteMany({ list: list._id });
    res.json({ message: 'List removed' });
});

router.delete('/:id/game/:gameId', auth, validate({ params: schemas.lists.removeGameParams }), async (req, res) => {
    const { id, gameId } = req.valid.params;

    const list = await List.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { $pull: { games: gameId } },
        { new: true },
    )
        .populate('games')
        .populate('user', USER_FIELDS);
    if (!list) throw notFound('List not found');

    res.json(list);
});

export default router;
