import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // e.g., "Currently Playing", "Completed", "Wishlist", "Abandoned"
    description: { type: String },
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
    isCustom: { type: Boolean, default: false }, // To distinguish between default lists and custom user lists
}, {
    timestamps: true
});

// Ensure a user can't have duplicate list names (optional, but good for default lists)
listSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('List', listSchema);
