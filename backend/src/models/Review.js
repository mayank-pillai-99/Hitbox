import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String },
}, {
    timestamps: true
});

// Prevent multiple reviews for the same game by the same user
reviewSchema.index({ user: 1, game: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
