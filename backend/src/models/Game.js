import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    releaseDate: { type: Date },
    genre: [{ type: String }],
    platforms: [{ type: String }],
    developer: { type: String },
    publisher: { type: String },
    averageRating: { type: Number, default: 0 },
}, {
    timestamps: true
});

export default mongoose.model('Game', gameSchema);
