import mongoose from 'mongoose';

const gameStatusSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        status: {
            type: String,
            enum: ['played', 'playing', 'want_to_play'],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Ensure a user can only have one status per game
gameStatusSchema.index({ user: 1, game: 1 }, { unique: true });
// Per-game status counts on the game page.
gameStatusSchema.index({ game: 1, status: 1 });

export default mongoose.model('GameStatus', gameStatusSchema);
