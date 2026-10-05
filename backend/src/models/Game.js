import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
    {
        igdbId: { type: Number, unique: true }, // External ID from IGDB
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
        // Screenshots, trailers and similar games from IGDB, cached so game pages don't spend IGDB quota.
        extras: {
            screenshots: [{ _id: false, thumb: String, full: String }],
            videos: [{ _id: false, youtubeId: String, name: String }],
            similarGames: [{ _id: false, igdbId: Number, title: String, coverImage: String }],
            fetchedAt: Date,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Game', gameSchema);
