import express from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { getBacklog } from '../services/backlog.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

router.get('/', auth, validate({ query: schemas.backlog.query }), async (req, res) => {
    res.json(await getBacklog(req.user.id, req.valid.query.time));
});

export default router;
