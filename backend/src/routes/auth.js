import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { env } from '../config/env.js';
import { badRequest, notFound } from '../lib/errors.js';
import { getUserStats } from '../services/stats.service.js';
import * as schemas from '../schemas/index.js';

const router = express.Router();

const signToken = (user) => jwt.sign({ user: { id: user.id } }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

router.post('/register', authLimiter, validate({ body: schemas.auth.register }), async (req, res) => {
    const { username, email, password } = req.valid.body;

    if (await User.findOne({ email })) throw badRequest('User already exists');
    if (await User.findOne({ username })) throw badRequest('Username taken');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.json({ token: signToken(user) });
});

router.post('/login', authLimiter, validate({ body: schemas.auth.login }), async (req, res) => {
    const { email, password } = req.valid.body;

    const user = await User.findOne({ email });
    // Same message for an unknown email and a wrong password, so accounts can't be probed.
    if (!user || !(await bcrypt.compare(password, user.password))) throw badRequest('Invalid credentials');

    res.json({ token: signToken(user) });
});

// Tokens are stateless; the client discards its copy.
router.post('/logout', (_req, res) => res.json({ message: 'Logged out successfully' }));

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw notFound('User not found');

    res.json({ ...user.toObject(), stats: await getUserStats(user._id) });
});

router.put('/me', auth, validate({ body: schemas.auth.updateProfile }), async (req, res) => {
    const { username, email, bio, profilePicture } = req.valid.body;
    const userId = req.user.id;

    if (username) {
        const exists = await User.findOne({ username });
        if (exists && exists.id !== userId) throw badRequest('Username taken');
    }
    if (email) {
        const exists = await User.findOne({ email });
        if (exists && exists.id !== userId) throw badRequest('Email taken');
    }

    const update = Object.fromEntries(
        Object.entries({ username, email, bio, profilePicture }).filter(([, value]) => value !== undefined),
    );
    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('-password');
    if (!user) throw notFound('User not found');

    res.json(user);
});

export default router;
