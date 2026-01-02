import express from 'express';
import igdb from '../utils/igdb.js';
import Game from '../models/Game.js';
import { mapIGDBGame } from '../utils/mappers.js';

const router = express.Router();

// Search/Browse Games (IGDB)
router.get('/', async (req, res) => {
    try {
        const { search, ordering, platforms, genres, page } = req.query;

        // --- Filter Mapping (Frontend Slugs -> IGDB IDs) ---
        // TODO: In a real app, we'd fetch these from IGDB /genres and /platforms endpoints dynamically or cache them.

        const platformMap = {
            'pc': 6,
            'playstation': 48, // PS4 (Simpler to just map "PlayStation" to PS4 for now, or use [48, 167] for PS4+PS5)
            'xbox': 49, // Xbox One
            'nintendo': 130, // Switch
            'mac': 14,
            'ios': 39,
            'android': 34
        };

        const genreMap = {
            'rpg': 12,
            'action': 5,
            'adventure': 31,
            'shooter': 5, // IGDB 'Shooter' is 5
            'strategy': 15,
            'simulator': 13,
            'puzzle': 9,
            'racing': 10,
            'sport': 14
        };

        // --- Query Construction ---

        let whereClauses = [
            // 'category = (0, 8, 9, 10)', // Disabled: Causes 0 results with sorting
        ];

        if (genres && genreMap[genres.toLowerCase()]) {
            whereClauses.push(`genres = [${genreMap[genres.toLowerCase()]}]`);
        }

        if (platforms && platformMap[platforms.toLowerCase()]) {
            whereClauses.push(`platforms = [${platformMap[platforms.toLowerCase()]}]`);
        }

        // Note: 'search' in IGDB is a separate statement, not a where clause filter usually.
        // It acts as a fuzzy finder.

        let query = `fields name, cover.url, first_release_date, total_rating, total_rating_count, hypes, summary, genres.name, platforms.name, slug;`;

        // ... (sorting logic remains) ...

        // ... (query construction remains) ...

        // RE-INJECT LOGIC TO MATCH FILE CONTEXT IF NEEDED, BUT HERE WE JUST EDIT THE QUERY DEFINITION LINE OR ADD LOGGING
        // SINCE I CAN'T EASILY JUMP, I'LL USE TARGETCONTENT FOR THE QUERY LINE


        // Sorting
        // Map frontend 'ordering' to IGDB fields
        // rawg: -added, -released, released, -rating, name
        let sortStatement = '';
        if (ordering) {
            switch (ordering) {
                case '-added': // Popularity
                    sortStatement = 'sort total_rating_count desc;';
                    break;
                case '-released':
                    sortStatement = 'sort first_release_date desc;';
                    break;
                case 'released':
                    sortStatement = 'sort first_release_date asc;';
                    break;
                case '-rating':
                    sortStatement = 'sort total_rating desc;';
                    break;
                case 'name':
                    sortStatement = 'sort name asc;';
                    break;
                default:
                    sortStatement = 'sort total_rating_count desc;';
            }
        } else {
            sortStatement = 'sort total_rating_count desc;';
        }

        // Pagination
        const pageSize = 20;
        const pageNum = parseInt(page) || 1;
        const offset = (pageNum - 1) * pageSize;
        query += ` limit ${pageSize}; offset ${offset};`;

        // Search Handling
        // Logic Construction:
        // 1. Search (optional)
        // 2. Where (filters)
        // 3. Sort (ordering) - IGDB advises against sort with search, but we'll include it if filters exist or if specifically requested.

        if (search) {
            query += ` search "${search}";`;
        }

        // Apply filters
        if (whereClauses.length > 0) {
            query += ` where ${whereClauses.join(' & ')};`;
        }

        // Apply sorting (Only if NOT searching, to rely on search relevance, OR if we want to force it)
        // For now, let's only sort if NOT searching. or if the user explicitly picked a sort?
        // IGDB: "When using search, results are sorted by relevance by default."
        // If we verify that sorting works with search, we can enable it.
        // Let's keep it simple: strict sort if no search. If search, rely on relevance (default).
        if (!search) {
            query += ` ${sortStatement}`;
        }

        console.log("IGDB Query:", query);

        const response = await igdb.post('/games', query);
        console.log("IGDB Response Items:", response.data.length);
        const igdbGames = response.data;

        // Get IGDB IDs to check against local DB
        const igdbIds = igdbGames.map(g => g.id);
        const localGames = await Game.find({ igdbId: { $in: igdbIds } });

        // Map local games
        const localGameMap = {};
        localGames.forEach(g => {
            localGameMap[g.igdbId] = g;
        });

        const games = igdbGames.map(g => {
            const mapped = mapIGDBGame(g);
            if (localGameMap[g.id]) {
                mapped.averageRating = localGameMap[g.id].averageRating || 0;
                // If local rating exists, use it for display 'rating' too?
                // The prompt requirements said: "prioritize local Hitbox ratings".
                // So if local averageRating > 0, show it.
                if (mapped.averageRating > 0) {
                    mapped.rating = mapped.averageRating;
                }
            }
            return mapped;
        });

        res.json({
            results: games,
            // IGDB doesn't return total count in the same query. We'd need a separate /count query.
            // For now, we'll just assume 'next' is true if we got full page_size items.
            next: games.length === pageSize
        });

    } catch (err) {
        console.error("IGDB API Error:", err.message);
        if (err.response) console.error(err.response.data);
        res.status(500).json({ message: 'Failed to fetch games' });
    }
});

// Get Game Details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let game;

        // 1. Check Local DB (ObjectId)
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            game = await Game.findById(id);
        } else {
            // 2. Check Local DB (IGDB ID)
            // Note: req.params.id is string, DB igdbId is Number. Cast it.
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                game = await Game.findOne({ igdbId: numericId });
            }
        }

        if (game) {
            return res.json(game);
        }

        // 3. Fetch from IGDB
        try {
            const query = `
                fields name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug, involved_companies.company.name;
                where id = ${id};
            `;
            const response = await igdb.post('/games', query);

            if (response.data && response.data.length > 0) {
                game = mapIGDBGame(response.data[0]);

                // Add developer if available
                if (response.data[0].involved_companies) {
                    const devs = response.data[0].involved_companies.map(c => c.company.name);
                    game.developer = devs.join(', ');
                }

                res.json(game);
            } else {
                return res.status(404).json({ message: 'Game not found' });
            }

        } catch (apiErr) {
            console.error(apiErr);
            throw apiErr;
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
