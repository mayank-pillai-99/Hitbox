import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
    {
        follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true },
);

// One follow per pair. This index also serves "who does X follow".
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Followers of X, and follower counts.
followSchema.index({ following: 1, createdAt: -1 });

export default mongoose.model('Follow', followSchema);
