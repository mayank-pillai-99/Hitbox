import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import Game from '../src/models/Game.js';
import Review from '../src/models/Review.js';
import User from '../src/models/User.js';

describe.skipIf(!process.env.MONGO_TEST_URI)('taste match', () => {
    const app = createApp();
    let me;
    let games;
    const as = (user) => ({ 'x-auth-token': jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET) });
    const rate = (user, game, rating) => Review.create({ user: user._id, game: game._id, rating });

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
        await mongoose.connection.dropDatabase();
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));

        games = await Game.create(
            ['Celeste', 'Hades', 'Tunic', 'Doom'].map((title, i) => ({
                igdbId: i + 1,
                title,
                coverImage: `https://x/${i}.jpg`,
            })),
        );
        const users = await User.create(
            ['me', 'twin', 'foe', 'stranger'].map((n) => ({ username: n, email: `${n}@secret.com`, password: 'x' })),
        );
        me = users[0];
        const [, twin, foe] = users;

        for (const [game, rating] of [
            [games[0], 5],
            [games[1], 4],
            [games[2], 2],
        ])
            await rate(me, game, rating);
        for (const [game, rating] of [
            [games[0], 5],
            [games[1], 4],
            [games[2], 2],
        ])
            await rate(twin, game, rating);
        for (const [game, rating] of [
            [games[0], 1],
            [games[1], 4],
            [games[2], 5],
        ])
            await rate(foe, game, rating);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('requires login', async () => {
        expect((await request(app).get('/api/users/twin/match')).status).toBe(401);
    });

    it('refuses to compare you with yourself, and 404s unknown members', async () => {
        expect((await request(app).get('/api/users/me/match').set(as(me))).status).toBe(400);
        expect((await request(app).get('/api/users/nobody/match').set(as(me))).status).toBe(404);
    });

    it('is 100 percent with someone who rates identically, and lists what you both loved', async () => {
        const res = await request(app).get('/api/users/twin/match').set(as(me));
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ shared: 3, percent: 100, confidence: 'medium' });
        expect(res.body.bothLoved.map((r) => r.game.title)).toEqual(['Celeste', 'Hades']);
        expect(res.body.bothLoved[0]).toMatchObject({ mine: 5, theirs: 5, game: { coverImage: 'https://x/0.jpg' } });
        expect(res.body.disagree).toEqual([]);
    });

    it('shows where you disagree, biggest gap first', async () => {
        const res = await request(app).get('/api/users/foe/match').set(as(me));
        // gaps 4, 0, 3 -> mean 7/3 -> about 42 percent
        expect(res.body.percent).toBe(42);
        expect(res.body.disagree.map((r) => `${r.game.title}:${r.mine}/${r.theirs}`)).toEqual([
            'Celeste:5/1',
            'Tunic:2/5',
        ]);
        expect(res.body.bothLoved.map((r) => r.game.title)).toEqual(['Hades']);
    });

    it('says so when nothing overlaps', async () => {
        const res = await request(app).get('/api/users/stranger/match').set(as(me));
        expect(res.body).toEqual({ shared: 0, percent: null, confidence: 'none', bothLoved: [], disagree: [] });
    });

    it('never exposes emails or passwords', async () => {
        const text = JSON.stringify((await request(app).get('/api/users/twin/match').set(as(me))).body);
        expect(text).not.toContain('@secret.com');
        expect(text).not.toContain('password');
    });
});
