import express from 'express';
import List from '../models/List.js';
import Game from '../models/Game.js';
import Comment from '../models/Comment.js';
import auth from '../middleware/auth.js';
import igdb from '../utils/igdb.js';
import { mapIGDBGame } from '../utils/mappers.js';

const router = express.Router();

// Discover all public lists (no auth required)
router.get('/discover', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'popular'; // 'popular', 'recent'

        // Build sort options
        let sortOptions = {};
        if (sort === 'recent') {
            sortOptions = { createdAt: -1 };
        } else {
            // Popular = most games in list
            sortOptions = { createdAt: -1 }; // We'll sort by games.length after population
        }

        const lists = await List.find()
            .populate('games', 'title coverImage')
            .populate('user', 'username profilePicture')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        // Transform for frontend with preview data
        const listsWithPreview = await Promise.all(lists.map(async (list) => {
            const commentCount = await Comment.countDocuments({ list: list._id });
            return {
                _id: list._id,
                name: list.name,
                description: list.description,
                gameCount: list.games.length,
                commentCount,
                previewGames: list.games.slice(0, 5).map(g => ({
                    title: g.title,
                    coverImage: g.coverImage
                })),
                user: {
                    username: list.user?.username || 'Unknown',
                    profilePicture: list.user?.profilePicture
                },
                createdAt: list.createdAt
            };
        }));

        // Sort by popularity (most games) if requested
        if (sort === 'popular') {
            listsWithPreview.sort((a, b) => b.gameCount - a.gameCount);
        }

        const total = await List.countDocuments();

        res.json({
            lists: listsWithPreview,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: total
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get current user's lists
router.get('/', auth, async (req, res) => {
    try {
        const lists = await List.find({ user: req.user.id }).populate('games');
        res.json(lists);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create a new list
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;

        const newList = new List({
            user: req.user.id,
            name,
            description,
            isCustom: true,
        });

        const list = await newList.save();
        res.json(list);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add game to list
router.post('/:id/add', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        const list = await List.findById(req.params.id);

        if (!list) return res.status(404).json({ message: 'List not found' });
        if (list.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let targetGameId = gameId;

        // Check if gameId is numeric (IGDB ID) and not an ObjectId
        if (!String(gameId).match(/^[0-9a-fA-F]{24}$/)) {
            const numericId = parseInt(gameId);
            if (isNaN(numericId)) {
                return res.status(400).json({ message: 'Invalid game ID' });
            }
            // Check if we have it in DB
            let game = await Game.findOne({ igdbId: numericId });

            if (!game) {
                // Not in DB, fetch from IGDB and create it
                try {
                    const query = `
                        fields name, cover.url, first_release_date, total_rating, summary, genres.name, platforms.name, slug, involved_companies.company.name;
                        where id = ${numericId};
                    `;
                    const igdbRes = await igdb.post('/games', query);

                    if (igdbRes.data && igdbRes.data.length > 0) {
                        const mappedGame = mapIGDBGame(igdbRes.data[0]);

                        // Add developer if available
                        if (igdbRes.data[0].involved_companies) {
                            const devs = igdbRes.data[0].involved_companies.map(c => c.company.name);
                            mappedGame.developer = devs.join(', ');
                        }

                        // mapIGDBGame returns a plain object, we need to save it as a Mongoose document
                        // Be careful: mapIGDBGame doesn't return exactly Mongoose schema format for everything?
                        // Actually it returns a clean object. We can check Game.js model.
                        // Game model has: igdbId, title, slug, description, coverImage, releaseDate, genre, platforms, developer, averageRating
                        // mapIGDBGame returns: id (we need to rename to igdbId), title, slug, description, coverImage, releaseDate, genre, platforms

                        const newGame = new Game({
                            igdbId: mappedGame.id,
                            title: mappedGame.title,
                            slug: mappedGame.slug,
                            description: mappedGame.description,
                            coverImage: mappedGame.coverImage,
                            releaseDate: mappedGame.releaseDate,
                            averageRating: 0, // Default for local
                            genre: mappedGame.genre,
                            platforms: mappedGame.platforms,
                            developer: mappedGame.developer
                        });

                        game = await newGame.save();
                    } else {
                        return res.status(404).json({ message: 'Game not found on IGDB' });
                    }
                } catch (fetchErr) {
                    console.error("Failed to fetch/save IGDB game:", fetchErr.message);
                    return res.status(500).json({ message: 'Failed to fetch game details' });
                }
            }
            if (game) {
                targetGameId = game._id;
            } else {
                return res.status(404).json({ message: 'Game could not be found or created' });
            }
        }

        // Check if game already in list (using safe string comparison for ObjectIds)
        if (list.games.some(id => id.toString() === targetGameId.toString())) {
            return res.status(400).json({ message: 'Game already in list' });
        }

        list.games.push(targetGameId);
        await list.save();

        res.json(list);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get a specific list by ID
router.get('/:id', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
            .populate('games')
            .populate('user', 'username profilePicture');

        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'List not found' });
        res.status(500).send('Server error');
    }
});

// Update a list
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        let list = await List.findById(req.params.id);

        if (!list) return res.status(404).json({ message: 'List not found' });
        if (list.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        list.name = name || list.name;
        list.description = description !== undefined ? description : list.description;

        await list.save();
        res.json(list);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'List not found' });
        res.status(500).send('Server error');
    }
});

// Delete a list
router.delete('/:id', auth, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);

        if (!list) return res.status(404).json({ message: 'List not found' });
        if (list.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await list.deleteOne();
        res.json({ message: 'List removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'List not found' });
        res.status(500).send('Server error');
    }
});

// Remove game from list
router.delete('/:id/game/:gameId', auth, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);

        if (!list) return res.status(404).json({ message: 'List not found' });
        if (list.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Filter out the game
        const originalLength = list.games.length;
        list.games = list.games.filter(game => game.toString() !== req.params.gameId);

        if (list.games.length === originalLength) {
            return res.status(404).json({ message: 'Game not found in list' });
        }

        await list.save();

        // Return fully populated list so frontend updates correctly
        const populatedList = await List.findById(req.params.id)
            .populate('games')
            .populate('user', 'username profilePicture');

        res.json(populatedList);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'List not found' });
        res.status(500).send('Server error');
    }
});

export default router;
