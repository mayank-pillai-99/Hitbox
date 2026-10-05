import express from 'express';
import igdb from '../lib/igdb.js';
import Game from '../models/Game.js';
import validate from '../middleware/validate.js';
import { mapIGDBGame } from '../lib/mappers.js';
import { notFound } from '../lib/errors.js';
import { buildBrowseQuery, PAGE_SIZE } from '../services/igdbQuery.js';
import { findLocalGame, fetchIGDBGame, isObjectId } from '../services/game.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

router.get('/', validate({ query: schemas.games.query }), async (req, res) => {
    const { data: igdbGames } = await igdb.post('/games', buildBrowseQuery(req.valid.query));

    // Overlay what Hitbox knows locally: its own id and the community rating.
    const localGames = await Game.find({ igdbId: { $in: igdbGames.map((g) => g.id) } });
    const localByIgdbId = new Map(localGames.map((g) => [g.igdbId, g]));

    const results = igdbGames.map((g) => {
        const mapped = mapIGDBGame(g);
        const local = localByIgdbId.get(g.id);
        if (local) {
            mapped._id = local._id;
            if (local.averageRating > 0) mapped.rating = local.averageRating;
        }
        return mapped;
    });

    res.json({ results, next: results.length === PAGE_SIZE });
});

router.get('/:id', validate({ params: schemas.games.params }), async (req, res) => {
    const { id } = req.valid.params;

    const local = await findLocalGame(id);
    if (local) return res.json(local);

    // A Mongo id that isn't saved locally can't exist in IGDB either.
    const game = isObjectId(id) ? null : await fetchIGDBGame(id);
    if (!game) throw notFound('Game not found');

    res.json(game);
});

export default router;
