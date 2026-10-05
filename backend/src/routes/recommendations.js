import express from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { getRecommendations } from '../services/recommendations.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

router.get('/', auth, validate({ query: schemas.recommendations.query }), async (req, res) => {
    res.json(await getRecommendations(req.user.id, req.valid.query.limit));
});

export default router;
