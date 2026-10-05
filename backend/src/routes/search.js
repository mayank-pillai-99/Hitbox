import express from 'express';
import validate from '../middleware/validate.js';
import { searchAll } from '../services/search.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

router.get('/', validate({ query: schemas.search.query }), async (req, res) => {
    res.json(await searchAll(req.valid.query.q));
});

export default router;
