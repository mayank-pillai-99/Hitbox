import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/logout', (_, res) => res.json({ message: 'Logged out successfully' }));

// Get Current User
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [reviews, lists] = await Promise.all([
            mongoose.model('Review').countDocuments({ user: req.user.id }),
            mongoose.model('List').countDocuments({ user: req.user.id })
        ]);

        res.json({
            ...user.toObject(),
            stats: {
                reviews,
                lists,
                gamesPlayed: 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update Profile
router.put('/me', auth, async (req, res) => {
    try {
        const { username, email, bio, profilePicture } = req.body;
        const userId = req.user.id;

        // Check conflicts
        if (username) {
            const exists = await User.findOne({ username });
            if (exists && exists.id !== userId) return res.status(400).json({ message: 'Username taken' });
        }

        if (email) {
            const exists = await User.findOne({ email });
            if (exists && exists.id !== userId) return res.status(400).json({ message: 'Email taken' });
        }

        const update = {};
        if (username) update.username = username;
        if (email) update.email = email;
        if (bio !== undefined) update.bio = bio;
        if (profilePicture !== undefined) update.profilePicture = profilePicture;

        const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('-password');
        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
