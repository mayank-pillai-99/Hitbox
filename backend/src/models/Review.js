import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, maxlength: 5000 },
        spoiler: { type: Boolean, default: false },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
    },
);

// Prevent multiple reviews for the same game by the same user
reviewSchema.index({ user: 1, game: 1 }, { unique: true });
// Game pages list a game's reviews newest first; the home page lists the newest overall.
reviewSchema.index({ game: 1, createdAt: -1 });
reviewSchema.index({ createdAt: -1 });
// A member's newest reviews, for the activity feed.
reviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
