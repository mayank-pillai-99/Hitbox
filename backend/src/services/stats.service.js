import mongoose from 'mongoose';
import Review from '../models/Review.js';
import List from '../models/List.js';
import GameStatus from '../models/GameStatus.js';

export const getUserStats = async (userId) => {
    const [reviews, lists, gamesPlayed] = await Promise.all([
        Review.countDocuments({ user: userId }),
        List.countDocuments({ user: userId }),
        GameStatus.countDocuments({ user: userId, status: 'played' }),
    ]);
    return { reviews, lists, gamesPlayed };
};

export const pagination = (page, limit, total) => ({
    current: page,
    total: Math.ceil(total / limit),
    count: total,
});

export const toObjectId = (id) => new mongoose.Types.ObjectId(id);
