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

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Create token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Create token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Get Current User (Me)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate stats
        const reviewsCount = await mongoose.model('Review').countDocuments({ user: req.user.id });
        const listRoutes = await mongoose.model('List').countDocuments({ user: req.user.id });

        res.json({
            ...user.toObject(),
            stats: {
                reviews: reviewsCount,
                lists: listRoutes,
                gamesPlayed: 0 // Placeholder until we have a "Played" status
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update User Profile
router.put('/me', auth, async (req, res) => {
    try {
        const { username, email, bio, profilePicture } = req.body;
        const userId = req.user.id;

        // Check availability if changing
        if (username) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail && existingEmail.id !== userId) {
                return res.status(400).json({ message: 'Email is already taken' });
            }
        }

        // Initialize update object
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (bio !== undefined) updateFields.bio = bio;
        if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
