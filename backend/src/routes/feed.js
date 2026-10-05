import express from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { getFeed } from '../services/feed.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

router.get('/', auth, validate({ query: schemas.feed.query }), async (req, res) => {
    res.json(await getFeed(req.user.id, req.valid.query));
});

export default router;
