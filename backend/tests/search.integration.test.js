import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// IGDB is replaced so the tests control its answers and can count calls.
const post = vi.fn();
vi.mock('../src/lib/igdb.js', () => ({ default: { post } }));

const { createApp } = await import('../src/app.js');
const { clearSearchCache } = await import('../src/services/search.service.js');
const { default: Game } = await import('../src/models/Game.js');
const { default: List } = await import('../src/models/List.js');
const { default: User } = await import('../src/models/User.js');

const igdbRecord = (id, name) => ({
    id,
    name,
    slug: name.toLowerCase(),
    cover: { url: `//images.igdb.com/igdb/image/upload/t_thumb/co${id}.jpg` },
});

describe.skipIf(!process.env.MONGO_TEST_URI)('search', () => {
    const app = createApp();
    let danaId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
        await mongoose.connection.dropDatabase();
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));

        const users = await User.create(
            ['dana', 'daniel', 'eli', 'a.b'].map((n) => ({ username: n, email: `${n}@x.com`, password: 'x' })),
        );
        danaId = users[0]._id;
        const [celeste] = await Game.create([{ igdbId: 100, title: 'Celeste', averageRating: 4.5 }]);
        await List.create([
            { user: danaId, name: 'Best RPGs', games: [celeste._id] },
            { user: danaId, name: 'Cozy picks' },
            { user: users[2]._id, name: 'Dark RPG gems' },
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(() => {
        post.mockReset();
        post.mockResolvedValue({ data: [igdbRecord(100, 'Celeste'), igdbRecord(200, 'Celeste Remix')] });
        clearSearchCache();
    });

    it('searches games, members and lists together', async () => {
        const res = await request(app).get('/api/search?q=da');
        expect(res.status).toBe(200);
        expect(res.body.members.map((m) => m.username)).toEqual(['dana', 'daniel']);
        expect(res.body.games).toHaveLength(2);

        const lists = (await request(app).get('/api/search?q=rpg')).body.lists;
        expect(lists.map((l) => l.name).sort()).toEqual(['Best RPGs', 'Dark RPG gems']);
        expect(lists.find((l) => l.name === 'Best RPGs')).toMatchObject({ gameCount: 1, user: { username: 'dana' } });
    });

    it('overlays the local id and rating on games Hitbox has saved', async () => {
        const { games } = (await request(app).get('/api/search?q=celeste')).body;
        const saved = games.find((g) => g.igdbId === 100);
        const unsaved = games.find((g) => g.igdbId === 200);
        expect(saved.rating).toBe(4.5);
        expect(saved._id).not.toBe(100);
        expect(unsaved._id).toBe(200);
        expect(unsaved.coverImage).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big/co200.jpg');
    });

    it('only asks IGDB for a few results and quotes the search term', async () => {
        await request(app).get('/api/search?q=%22%3B%20limit%20500');
        const query = post.mock.calls[0][1];
        expect(query).toContain('limit 5; offset 0;');
        expect(query).toContain('search "\\"; limit 500";');
    });

    it('treats regex characters literally', async () => {
        const dotted = (await request(app).get('/api/search?q=a.')).body.members;
        expect(dotted.map((m) => m.username)).toEqual(['a.b']);
        // ".*" would match everything if it were treated as a pattern.
        expect((await request(app).get('/api/search?q=.*')).body.members).toEqual([]);
        expect((await request(app).get('/api/search?q=((')).status).toBe(200);
    });

    it('never returns passwords or emails', async () => {
        const text = JSON.stringify((await request(app).get('/api/search?q=da')).body);
        expect(text).not.toContain('password');
        expect(text).not.toContain('@x.com');
    });

    it('caches repeat queries', async () => {
        await request(app).get('/api/search?q=da');
        await request(app).get('/api/search?q=DA');
        expect(post).toHaveBeenCalledTimes(1);
    });

    it('still returns members and lists when IGDB is down, without caching that result', async () => {
        post.mockRejectedValueOnce(new Error('boom'));
        const down = await request(app).get('/api/search?q=da');
        expect(down.status).toBe(200);
        expect(down.body.games).toEqual([]);
        expect(down.body.members).toHaveLength(2);

        const recovered = await request(app).get('/api/search?q=da');
        expect(recovered.body.games).toHaveLength(2);
    });

    it('validates the query', async () => {
        expect((await request(app).get('/api/search')).status).toBe(400);
        expect((await request(app).get('/api/search?q=a')).status).toBe(400);
        expect((await request(app).get(`/api/search?q=${'x'.repeat(61)}`)).status).toBe(400);
    });

    describe('filters on the full pages', () => {
        it('filters members by name and counts only matches', async () => {
            const res = await request(app).get('/api/users?q=dan');
            expect(res.body.members.map((m) => m.username).sort()).toEqual(['dana', 'daniel']);
            expect(res.body.pagination.count).toBe(2);
            expect((await request(app).get('/api/users?q=nobody')).body.members).toEqual([]);
            expect((await request(app).get('/api/users')).body.pagination.count).toBe(4);
        });

        it('filters lists by name and counts only matches', async () => {
            const res = await request(app).get('/api/lists/discover?q=rpg');
            expect(res.body.lists.map((l) => l.name).sort()).toEqual(['Best RPGs', 'Dark RPG gems']);
            expect(res.body.pagination.count).toBe(2);
            expect((await request(app).get('/api/lists/discover?q=zzz')).body.lists).toEqual([]);
        });

        it('treats regex characters in q literally on both', async () => {
            expect((await request(app).get('/api/users?q=.*')).body.members).toEqual([]);
            expect((await request(app).get('/api/lists/discover?q=.*')).body.lists).toEqual([]);
        });
    });
});
