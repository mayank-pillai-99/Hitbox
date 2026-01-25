import express from 'express';
import igdb from '../utils/igdb.js';
import Game from '../models/Game.js';
import { mapIGDBGame } from '../utils/mappers.js';

const router = express.Router();

// Mappings
const PLATFORMS = {
    'pc': 6,
    'playstation': 48,
    'xbox': 49,
    'nintendo': 130,
    'mac': 14,
    'ios': 39,
    'android': 34
};

const GENRES = {
    'rpg': 12,
    'action': 5,
    'adventure': 31,
    'shooter': 5,
    'strategy': 15,
    'simulator': 13,
    'puzzle': 9,
    'racing': 10,
    'sport': 14
};

// Search/Browse Games
router.get('/', async (req, res) => {
    try {
        const { search, ordering, platforms, genres, dates, page } = req.query;
        let where = [];

        if (genres && GENRES[genres.toLowerCase()]) where.push(`genres = [${GENRES[genres.toLowerCase()]}]`);
        if (platforms && PLATFORMS[platforms.toLowerCase()]) where.push(`platforms = [${PLATFORMS[platforms.toLowerCase()]}]`);

        if (dates) {
            const [start, end] = dates.split(',');
            if (start && end) {
                where.push(`first_release_date >= ${Math.floor(new Date(start).getTime() / 1000)}`);
                where.push(`first_release_date <= ${Math.floor(new Date(end).getTime() / 1000)}`);
            }
        }

        let query = `fields name, cover.url, first_release_date, total_rating, total_rating_count, hypes, summary, genres.name, platforms.name, slug;`;

        // Sorting
        let sort = 'sort total_rating_count desc;';
        if (ordering === '-released') sort = 'sort first_release_date desc;';
        if (ordering === 'released') sort = 'sort first_release_date asc;';
        if (ordering === '-rating') sort = 'sort total_rating desc;';
        if (ordering === 'name') sort = 'sort name asc;';

        const pageSize = 20;
        const pageNum = parseInt(page) || 1;
        query += ` limit ${pageSize}; offset ${(pageNum - 1) * pageSize};`;

        if (search) query += ` search "${search}";`;
        if (where.length > 0) query += ` where ${where.join(' & ')};`;
        if (!search) query += ` ${sort}`;

        const { data: igdbGames } = await igdb.post('/games', query);

        // Merge with local data (ratings)
        const localGames = await Game.find({ igdbId: { $in: igdbGames.map(g => g.id) } });
        const localMap = localGames.reduce((acc, g) => ({ ...acc, [g.igdbId]: g }), {});

        const results = igdbGames.map(g => {
            const mapped = mapIGDBGame(g);
            if (localMap[g.id]) {
                mapped._id = localMap[g.id]._id; // Use local Mongo ID if available
                if (localMap[g.id].averageRating > 0) {
                    mapped.rating = localMap[g.id].averageRating;
                }
            }
            return mapped;
        });

        res.json({
            results,
            next: results.length === pageSize
        });

    } catch (err) {
        console.error("IGDB Error:", err.message);
        res.status(500).json({ message: 'Failed to fetch games' });
    }
});

// Get Game Details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let game;

        // Check local DB first
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            game = await Game.findById(id);
        } else if (!isNaN(parseInt(id))) {
            game = await Game.findOne({ igdbId: parseInt(id) });
        }

        if (game) return res.json(game);

        // Fetch from IGDB
        const query = `
            fields name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug, involved_companies.company.name;
            where id = ${id};
        `;
        const { data } = await igdb.post('/games', query);

        if (!data || data.length === 0) return res.status(404).json({ message: 'Game not found' });

        game = mapIGDBGame(data[0]);
        if (data[0].involved_companies) {
            game.developer = data[0].involved_companies.map(c => c.company.name).join(', ');
        }

        res.json(game);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

export default router;
