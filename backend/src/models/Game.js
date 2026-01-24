import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    igdbId: { type: Number, unique: true, sparse: true }, // External ID from IGDB
    title: { type: String, required: true },
    slug: { type: String },
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
