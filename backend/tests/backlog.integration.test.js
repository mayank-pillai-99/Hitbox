import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// IGDB is replaced so the tests control time-to-beat answers and can count calls.
const post = vi.fn();
vi.mock('../src/lib/igdb.js', () => ({ default: { post } }));

const { createApp } = await import('../src/app.js');
const { default: Game } = await import('../src/models/Game.js');
const { default: GameStatus } = await import('../src/models/GameStatus.js');
const { default: Review } = await import('../src/models/Review.js');
const { default: User } = await import('../src/models/User.js');
const { TIME_TO_BEAT_TTL_MS } = await import('../src/services/timeToBeat.service.js');

// Seconds, as IGDB reports them.
const HOURS = (h) => h * 3600;
const answers = {
    1: { game_id: 1, normally: HOURS(70) }, // long RPG
    2: { game_id: 2, normally: HOURS(5) }, // short puzzle
    3: { game_id: 3, hastily: HOURS(15) }, // medium RPG, only the quick time is known
    // game 4 has no entry: unknown length
};

const timeCalls = () => post.mock.calls.filter(([endpoint]) => endpoint === '/game_time_to_beats');

describe.skipIf(!process.env.MONGO_TEST_URI)('backlog planner', () => {
    const app = createApp();
    let me;
    let other;
    let games;
    const as = (user) => ({ 'x-auth-token': jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET) });

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
        post.mockImplementation((endpoint, query) => {
            if (endpoint !== '/game_time_to_beats') {
                // The extras query for a game: just enough of a record to count as found.
                const id = Number(query.match(/where id = (\d+)/)?.[1]);
                return Promise.resolve({ data: id ? [{ id, name: `Game ${id}` }] : [] });
            }
            const ids = query
                .match(/game_id = \(([\d,]+)\)/)[1]
                .split(',')
                .map(Number);
            return Promise.resolve({ data: ids.map((id) => answers[id]).filter(Boolean) });
        });
        await Promise.all([Game.deleteMany({}), GameStatus.deleteMany({}), Review.deleteMany({}), User.deleteMany({})]);

        [me, other] = await User.create(
            ['me', 'other'].map((n) => ({ username: n, email: `${n}@x.com`, password: 'x' })),
        );
        games = await Game.create([
            { igdbId: 1, title: 'Big RPG', genre: ['RPG'], averageRating: 4.5 },
            { igdbId: 2, title: 'Tiny Puzzle', genre: ['Puzzle'] },
            { igdbId: 3, title: 'Mid RPG', genre: ['RPG'] },
            { igdbId: 4, title: 'Mystery', genre: [] },
            { igdbId: 5, title: 'Already loved', genre: ['RPG'] },
        ]);
        // The member loves RPGs, so RPGs in the backlog should lead.
        await Review.create({ user: me._id, game: games[4]._id, rating: 5 });
        for (const game of games.slice(0, 4))
            await GameStatus.create({ user: me._id, game: game._id, status: 'want_to_play' });
        // Someone else's backlog must never appear.
        await GameStatus.create({ user: other._id, game: games[4]._id, status: 'want_to_play' });
        // Playing, not backlog.
        await GameStatus.create({ user: me._id, game: games[4]._id, status: 'playing' });
    });

    it('requires login and validates the length filter', async () => {
        expect((await request(app).get('/api/backlog')).status).toBe(401);
        expect((await request(app).get('/api/backlog?time=forever').set(as(me))).status).toBe(400);
    });

    it('ranks the want-to-play list by fit, with hours and reasons', async () => {
        const res = await request(app).get('/api/backlog').set(as(me));
        expect(res.status).toBe(200);
        expect(res.body.items.map((i) => i.game.title)).toEqual(['Big RPG', 'Mid RPG', 'Tiny Puzzle', 'Mystery']);

        const [first] = res.body.items;
        expect(first.hours).toBe(70);
        expect(first.reason).toBe('Matches your taste for RPG, about 70 hours');
        expect(res.body.items[1].hours).toBe(15); // fell back to the quick time
        expect(res.body.items[3]).toMatchObject({ hours: null, reason: 'In your backlog, length unknown' });
    });

    it('totals the whole backlog', async () => {
        const { summary } = (await request(app).get('/api/backlog').set(as(me))).body;
        expect(summary).toEqual({ games: 4, hours: 90, unknown: 1 });
    });

    it('filters by length but still totals everything', async () => {
        const short = (await request(app).get('/api/backlog?time=short').set(as(me))).body;
        expect(short.items.map((i) => i.game.title)).toEqual(['Tiny Puzzle']);
        expect(short.summary.games).toBe(4);

        const medium = (await request(app).get('/api/backlog?time=medium').set(as(me))).body;
        expect(medium.items.map((i) => i.game.title)).toEqual(['Mid RPG']);

        const long = (await request(app).get('/api/backlog?time=long').set(as(me))).body;
        expect(long.items.map((i) => i.game.title)).toEqual(['Big RPG']);
    });

    it('is empty, not an error, with no backlog', async () => {
        const res = await request(app).get('/api/backlog').set(as(other));
        expect(res.body.items.map((i) => i.game.title)).toEqual(['Already loved']);
        const nobody = await User.create({ username: 'nobody', email: 'n@x.com', password: 'x' });
        const empty = await request(app).get('/api/backlog').set(as(nobody));
        expect(empty.body).toMatchObject({ items: [], summary: { games: 0, hours: 0, unknown: 0 } });
    });

    it('asks IGDB once for the whole backlog, then serves from the database', async () => {
        await request(app).get('/api/backlog').set(as(me));
        expect(timeCalls()).toHaveLength(1);
        expect(timeCalls()[0][1]).toContain('(1,2,3,4)');

        await request(app).get('/api/backlog').set(as(me));
        expect(timeCalls()).toHaveLength(1);
    });

    it('remembers games IGDB has no answer for, so it does not ask again', async () => {
        await request(app).get('/api/backlog').set(as(me));
        const mystery = await Game.findById(games[3]._id);
        expect(mystery.timeToBeat.hours).toBeNull();
        expect(mystery.timeToBeat.fetchedAt).toBeInstanceOf(Date);
    });

    it('asks again once an answer is a month old', async () => {
        await request(app).get('/api/backlog').set(as(me));
        await Game.collection.updateMany(
            {},
            { $set: { 'timeToBeat.fetchedAt': new Date(Date.now() - TIME_TO_BEAT_TTL_MS - 1000) } },
        );
        await request(app).get('/api/backlog').set(as(me));
        expect(timeCalls()).toHaveLength(2);
    });

    it('still answers when IGDB is down, without storing anything', async () => {
        post.mockRejectedValue(new Error('boom'));
        const res = await request(app).get('/api/backlog').set(as(me));
        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(4);
        expect(res.body.items.every((i) => i.hours === null)).toBe(true);
        expect((await Game.findById(games[0]._id)).timeToBeat?.fetchedAt).toBeUndefined();
    });

    it('does not leak anything private', async () => {
        const text = JSON.stringify((await request(app).get('/api/backlog').set(as(me))).body);
        expect(text).not.toContain('@x.com');
        expect(text).not.toContain('password');
    });

    describe('time to beat on game pages', () => {
        it('is part of the extras for a saved game', async () => {
            const res = await request(app).get(`/api/games/${games[0]._id}/extras`);
            expect(res.body.timeToBeat).toBe(70);
        });

        it('works for a game nobody has saved, and is null when unknown', async () => {
            post.mockImplementation((endpoint) =>
                endpoint === '/game_time_to_beats'
                    ? Promise.resolve({ data: [{ game_id: 999, normally: HOURS(8) }] })
                    : Promise.resolve({ data: [{ id: 999, name: 'Unsaved' }] }),
            );
            expect((await request(app).get('/api/games/999/extras')).body.timeToBeat).toBe(8);
            expect(await Game.countDocuments({ igdbId: 999 })).toBe(0);
        });

        it('does not fail the page when time to beat is unavailable', async () => {
            await Game.collection.updateOne({ _id: games[0]._id }, { $unset: { timeToBeat: '' } });
            post.mockImplementation((endpoint) =>
                endpoint === '/game_time_to_beats'
                    ? Promise.reject(new Error('boom'))
                    : Promise.resolve({ data: [{ id: 1, name: 'Big RPG' }] }),
            );
            const res = await request(app).get(`/api/games/${games[0]._id}/extras`);
            expect(res.status).toBe(200);
            expect(res.body.timeToBeat).toBeNull();
        });
    });
});
