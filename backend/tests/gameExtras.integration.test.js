import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// IGDB is replaced, so these tests count how often the service would have called it.
const post = vi.fn();
vi.mock('../src/lib/igdb.js', () => ({ default: { post } }));

const { createApp } = await import('../src/app.js');
const { default: Game } = await import('../src/models/Game.js');
const { clearExtrasMemory, EXTRAS_TTL_MS } = await import('../src/services/gameExtras.service.js');

const gamesCalls = () => post.mock.calls.filter(([endpoint]) => endpoint === '/games').length;

const igdbRecord = {
    screenshots: [{ image_id: 'sc6abc' }],
    videos: [{ video_id: 'dQw4w9WgXcQ', name: 'Trailer' }],
    similar_games: [{ id: 7, name: 'Hollow Knight' }],
};

describe.skipIf(!process.env.MONGO_TEST_URI)('game extras cache', () => {
    const app = createApp();
    let saved;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
        await mongoose.connection.dropDatabase();
        await Game.init();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        post.mockReset();
        post.mockResolvedValue({ data: [igdbRecord] });
        clearExtrasMemory();
        await Game.deleteMany({});
        saved = await Game.create({ igdbId: 100, title: 'Celeste' });
    });

    it('fetches once, stores the extras on a saved game, then serves the copy', async () => {
        const first = await request(app).get(`/api/games/${saved._id}/extras`);
        expect(first.status).toBe(200);
        expect(first.body.screenshots[0].full).toContain('t_screenshot_big/sc6abc.jpg');
        expect(first.body.videos).toEqual([{ youtubeId: 'dQw4w9WgXcQ', name: 'Trailer' }]);
        expect(first.body.similarGames).toEqual([{ _id: 7, igdbId: 7, title: 'Hollow Knight', coverImage: undefined }]);

        const again = await request(app).get('/api/games/100/extras'); // by IGDB id this time
        expect(again.body).toEqual(first.body);
        expect(gamesCalls()).toBe(1);
        expect((await Game.findById(saved._id)).extras.fetchedAt).toBeInstanceOf(Date);
    });

    it('refetches once the saved copy is older than a week', async () => {
        await request(app).get(`/api/games/${saved._id}/extras`);
        await Game.collection.updateOne(
            { _id: saved._id },
            { $set: { 'extras.fetchedAt': new Date(Date.now() - EXTRAS_TTL_MS - 1000) } },
        );
        await request(app).get(`/api/games/${saved._id}/extras`);
        expect(gamesCalls()).toBe(2);
    });

    it('caches unsaved games in memory without creating them', async () => {
        const first = await request(app).get('/api/games/555/extras');
        const second = await request(app).get('/api/games/555/extras');
        expect(first.status).toBe(200);
        expect(second.body).toEqual(first.body);
        expect(gamesCalls()).toBe(1);
        expect(await Game.countDocuments()).toBe(1);
    });

    it('returns 404 for a game IGDB does not know, and for unknown local ids', async () => {
        post.mockResolvedValue({ data: [] });
        expect((await request(app).get('/api/games/556/extras')).status).toBe(404);
        expect((await request(app).get('/api/games/64b7f0c2a1b2c3d4e5f60718/extras')).status).toBe(404);
    });

    it('returns 502 when IGDB is down, and does not cache the failure', async () => {
        post.mockRejectedValueOnce(Object.assign(new Error('boom'), { code: 'IGDB_AUTH_FAILED' }));
        expect((await request(app).get(`/api/games/${saved._id}/extras`)).status).toBe(502);
        expect((await request(app).get(`/api/games/${saved._id}/extras`)).status).toBe(200);
    });

    it('rejects malformed ids before calling IGDB', async () => {
        expect((await request(app).get('/api/games/1;drop/extras')).status).toBe(400);
        expect(post).not.toHaveBeenCalled();
    });
});
