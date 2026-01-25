import Game from '../models/Game.js';
import igdb from './igdb.js';
import { mapIGDBGame } from './mappers.js';

export const findOrCreateGame = async (gameId) => {
    // 1. Check if valid ObjectId (already in DB)
    if (String(gameId).match(/^[0-9a-fA-F]{24}$/)) {
        return Game.findById(gameId);
    }

    // 2. Check if numeric IGDB ID exists in DB
    const numericId = parseInt(gameId);
    if (isNaN(numericId)) throw new Error('Invalid Game ID');

    let game = await Game.findOne({ igdbId: numericId });
    if (game) return game;

    // 3. Fetch from IGDB and create
    const query = `
        fields name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug, involved_companies.company.name;
        where id = ${numericId};
    `;
    const response = await igdb.post('/games', query);

    if (!response.data || response.data.length === 0) return null;

    const mapped = mapIGDBGame(response.data[0]);

    if (response.data[0].involved_companies) {
        mapped.developer = response.data[0].involved_companies.map(c => c.company.name).join(', ');
    }

    // Mongoose Model
    const newGame = new Game({
        igdbId: mapped.igdbId, // mapped.igdbId is set in the mapper
        title: mapped.title,
        slug: mapped.slug,
        description: mapped.description,
        coverImage: mapped.coverImage,
        releaseDate: mapped.releaseDate,
        genre: mapped.genre,
        platforms: mapped.platforms,
        developer: mapped.developer,
        averageRating: 0
    });

    return await newGame.save();
};
