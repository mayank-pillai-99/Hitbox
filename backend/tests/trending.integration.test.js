import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// IGDB is replaced so the tests control its rankings and can count calls.
const post = vi.fn();
vi.mock('../src/lib/igdb.js', () => ({ default: { post } }));

const { createApp } = await import('../src/app.js');
const { clearTrendingCache } = await import('../src/services/trending.service.js');
const { default: Game } = await import('../src/models/Game.js');
const { default: Review } = await import('../src/models/Review.js');
const { default: GameStatus } = await import('../src/models/GameStatus.js');
const { default: User } = await import('../src/models/User.js');

const record = (id) => ({
    id,
    name: `G${id}`,
    slug: `g${id}`,
    cover: { url: `//images.igdb.com/igdb/image/upload/t_thumb/co${id}.jpg` },
    first_release_date: 1_500_000_000,
});

// Answers the three kinds of query the service sends.
const fakeIGDB = (endpoint, query) => {
    if (endpoint === '/popularity_primitives') {
        return Promise.resolve({ data: [{ game_id: 10 }, { game_id: 20 }, { game_id: 30 }] });
    }
    const ids = query.match(/where id = \(([\d,]+)\)/)?.[1];
    if (ids) return Promise.resolve({ data: ids.split(',').map((id) => record(Number(id))) });
    return Promise.resolve({ data: [record(501), record(502)] }); // the fallback browse query
};

describe.skipIf(!process.env.MONGO_TEST_URI)('trending games', () => {
    const app = createApp();
    const titles = async (path = '/api/games/trending') =>
        (await request(app).get(path)).body.results.map((g) => g.title);

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
        await mongoose.connection.dropDatabase();
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        post.mockReset();
        post.mockImplementation(fakeIGDB);
        clearTrendingCache();
        await Promise.all([Game.deleteMany({}), Review.deleteMany({}), GameStatus.deleteMany({}), User.deleteMany({})]);
    });

    it('follows IGDB popularity when the community has been quiet', async () => {
        const res = await request(app).get('/api/games/trending');
        expect(res.status).toBe(200);
        expect(res.body.windowDays).toBe(7);
        expect(res.body.results.map((g) => g.title)).toEqual(['G10', 'G20', 'G30']);
        expect(res.body.results[0].coverImage).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big/co10.jpg');
    });

    it('lifts games the community is busy with this week, ignoring older activity', async () => {
        const [u1, u2] = await User.create(
            ['a', 'b'].map((n) => ({ username: n, email: `${n}@x.com`, password: 'x' })),
        );
        const [g20, g30, g40] = await Game.create([
            { igdbId: 20, title: 'G20' },
            { igdbId: 30, title: 'G30', averageRating: 4.5 },
            { igdbId: 40, title: 'G40' },
        ]);

        // G30: two reviews this week. G20: a review a month ago, which must not count.
        await Review.create({ user: u1._id, game: g30._id, rating: 5 });
        await Review.create({ user: u2._id, game: g30._id, rating: 4 });
        const old = await Review.create({ user: u1._id, game: g20._id, rating: 5 });
        await Review.collection.updateOne(
            { _id: old._id },
            { $set: { createdAt: new Date(Date.now() - 30 * 86400000) } },
        );
        // G40 is not in IGDB's list at all: one review and one status this week is enough to show up.
        await Review.create({ user: u1._id, game: g40._id, rating: 4 });
        await GameStatus.create({ user: u2._id, game: g40._id, status: 'playing' });

        const res = await request(app).get('/api/games/trending');
        expect(res.body.results.map((g) => g.title)).toEqual(['G30', 'G10', 'G40', 'G20']);

        // Saved games carry their local id and community rating.
        const g30Result = res.body.results[0];
        expect(g30Result._id).toBe(String(g30._id));
        expect(g30Result.rating).toBe(4.5);
        expect(res.body.results[1]._id).toBe(10); // unsaved: IGDB id
    });

    it('serves repeat requests from the cache', async () => {
        await request(app).get('/api/games/trending');
        const calls = post.mock.calls.length;
        await request(app).get('/api/games/trending');
        expect(post.mock.calls.length).toBe(calls);
    });

    it('takes a prefix for smaller limits and validates the limit', async () => {
        expect(await titles('/api/games/trending?limit=2')).toEqual(['G10', 'G20']);
        expect((await request(app).get('/api/games/trending?limit=99')).status).toBe(400);
    });

    it('falls back to recent popular releases when IGDB popularity is unavailable', async () => {
        post.mockImplementation((endpoint, query) =>
            endpoint === '/popularity_primitives' ? Promise.reject(new Error('boom')) : fakeIGDB(endpoint, query),
        );
        const res = await request(app).get('/api/games/trending');
        expect(res.status).toBe(200);
        expect(res.body.results.map((g) => g.title)).toEqual(['G501', 'G502']);
    });

    it('is not mistaken for a game id', async () => {
        expect((await request(app).get('/api/games/trending')).status).toBe(200);
        expect((await request(app).get('/api/games/not-trending')).status).toBe(400);
    });
});
