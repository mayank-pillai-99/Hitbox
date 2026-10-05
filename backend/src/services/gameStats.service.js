import Review from '../models/Review.js';
import GameStatus from '../models/GameStatus.js';
import { resolveLocalGameId } from './game.service.js';
import { toObjectId } from './stats.service.js';

const STATUSES = ['played', 'playing', 'want_to_play'];

export const emptyStats = () => ({
    count: 0,
    average: 0,
    histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    statuses: { played: 0, playing: 0, want_to_play: 0 },
});

// Turns $group output ([{ _id: 4, count: 2 }, ...]) into the response shape.
// Ratings or statuses outside the expected sets are ignored.
export const shapeStats = (ratingGroups, statusGroups) => {
    const stats = emptyStats();
    let sum = 0;

    for (const { _id, count } of ratingGroups) {
        if (!(_id in stats.histogram)) continue;
        stats.histogram[_id] = count;
        stats.count += count;
        sum += _id * count;
    }
    stats.average = stats.count > 0 ? Math.round((sum / stats.count) * 10) / 10 : 0;

    for (const { _id, count } of statusGroups) {
        if (STATUSES.includes(_id)) stats.statuses[_id] = count;
    }
    return stats;
};

// A game that isn't saved locally has no reviews or statuses yet.
export const getGameStats = async (ref) => {
    const gameId = await resolveLocalGameId(ref);
    if (!gameId) return emptyStats();

    const game = toObjectId(gameId);
    const [ratingGroups, statusGroups] = await Promise.all([
        Review.aggregate([{ $match: { game } }, { $group: { _id: '$rating', count: { $sum: 1 } } }]),
        GameStatus.aggregate([{ $match: { game } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    return shapeStats(ratingGroups, statusGroups);
};
