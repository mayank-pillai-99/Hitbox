import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import Game from '../src/models/Game.js';
import GameStatus from '../src/models/GameStatus.js';
import Review from '../src/models/Review.js';
import User from '../src/models/User.js';

// MONGO_TEST_URI=mongodb://127.0.0.1:27017/hitbox-test npm test (wipes that database)
describe.skipIf(!process.env.MONGO_TEST_URI)('recommendations', () => {
    const app = createApp();
    let g; // games by letter
    let me;
    let newcomer;

    const asUser = (user) => ({ 'x-auth-token': jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET) });
    const rate = (user, game, rating) => Review.create({ user: user._id, game: game._id, rating });
    const names = (items) => items.map((i) => i.game.title);

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
        await mongoose.connection.dropDatabase();
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));

        const [A, B, C, D, E] = await Game.create([
            {
                igdbId: 1,
                title: 'A',
                genre: ['RPG'],
                extras: {
                    similarGames: [
                        { igdbId: 99, title: 'Unsaved Gem', coverImage: 'https://x/gem.jpg' },
                        { igdbId: 5, title: 'E' },
                    ],
                    fetchedAt: new Date(),
                },
            },
            { igdbId: 2, title: 'B', genre: ['RPG'] },
            { igdbId: 3, title: 'C', genre: ['Shooter'] },
            { igdbId: 4, title: 'D', genre: ['RPG'] },
            { igdbId: 5, title: 'E', genre: ['Puzzle'] },
        ]);
        g = { A, B, C, D, E };

        const [me_, u1, u2, u3, newcomer_] = await User.create(
            ['me', 'u1', 'u2', 'u3', 'newcomer'].map((name) => ({
                username: name,
                email: `${name}@x.com`,
                password: 'x',
            })),
        );
        me = me_;
        newcomer = newcomer_;

        await rate(me, A, 5);
        await rate(me, C, 1);
        await GameStatus.create({ user: me._id, game: B._id, status: 'want_to_play' });

        // u1 rates like me and loved D and B; u2 rates the opposite way; u3 shares nothing with me.
        for (const [game, rating] of [
            [A, 5],
            [C, 1],
            [D, 5],
            [B, 5],
        ])
            await rate(u1, game, rating);
        for (const [game, rating] of [
            [A, 1],
            [C, 5],
            [E, 5],
        ])
            await rate(u2, game, rating);
        await rate(u3, D, 1);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('requires login', async () => {
        expect((await request(app).get('/api/recommendations')).status).toBe(401);
    });

    it('recommends what similar members liked, ranked first and explained', async () => {
        const res = await request(app).get('/api/recommendations').set(asUser(me));
        expect(res.status).toBe(200);
        expect(res.body.personalized).toBe(true);

        expect(res.body.items[0].game.title).toBe('D');
        expect(res.body.items[0].reasons).toEqual([
            'Members with similar taste rated it highly',
            'Matches your taste for RPG',
        ]);
    });

    it('leaves out games already rated or tracked, and ignores members with opposite taste', async () => {
        const res = await request(app).get('/api/recommendations').set(asUser(me));
        const titles = names(res.body.items);
        expect(titles).not.toContain('A'); // rated
        expect(titles).not.toContain('C'); // rated
        expect(titles).not.toContain('B'); // tracked
        // E is only liked by u2, whose taste is the opposite of mine; it is here solely
        // because IGDB lists it as similar to A.
        const e = res.body.items.find((i) => i.game.title === 'E');
        expect(e.reasons).toEqual(['Similar to A']);
    });

    it("suggests IGDB's similar games even when nobody has saved them", async () => {
        const res = await request(app).get('/api/recommendations').set(asUser(me));
        const gem = res.body.items.find((i) => i.game.title === 'Unsaved Gem');
        expect(gem.game._id).toBe(99);
        expect(gem.game.coverImage).toBe('https://x/gem.jpg');
        expect(gem.reasons).toEqual(['Similar to A']);
        expect(await Game.countDocuments({ igdbId: 99 })).toBe(0);
    });

    it('does not leak user data', async () => {
        const text = JSON.stringify((await request(app).get('/api/recommendations').set(asUser(me))).body);
        expect(text).not.toContain('u1@x.com');
        expect(text).not.toContain('password');
    });

    it('falls back to popular games for someone who has rated nothing', async () => {
        const res = await request(app).get('/api/recommendations').set(asUser(newcomer));
        expect(res.body.personalized).toBe(false);
        expect(res.body.items.length).toBeGreaterThan(0);
        expect(res.body.items.every((i) => i.reasons[0] === 'Popular with Hitbox members')).toBe(true);
        expect(new Set(names(res.body.items.slice(0, 2)))).toEqual(new Set(['B', 'E']));
    });

    it('limits the number of picks and validates the limit', async () => {
        expect((await request(app).get('/api/recommendations?limit=1').set(asUser(me))).body.items).toHaveLength(1);
        expect((await request(app).get('/api/recommendations?limit=500').set(asUser(me))).status).toBe(400);
    });

    describe('members who liked this also liked', () => {
        it('lists other games loved by this game’s fans, with how many fans', async () => {
            const res = await request(app).get(`/api/games/${g.A._id}/also-liked`);
            expect(res.status).toBe(200);
            expect(new Set(names(res.body.map((game) => ({ game }))))).toEqual(new Set(['B', 'D']));
            expect(res.body.every((game) => game.supporters === 1)).toBe(true);
        });

        it('works by IGDB id and excludes the game itself', async () => {
            const res = await request(app).get('/api/games/3/also-liked'); // C is loved only by u2
            expect(names(res.body.map((game) => ({ game })))).toEqual(['E']);
        });

        it('returns nothing for games nobody liked or that are unknown', async () => {
            expect((await request(app).get(`/api/games/${g.E._id}/also-liked`)).body.map((x) => x.title)).toEqual([
                'C',
            ]);
            expect((await request(app).get('/api/games/9999/also-liked')).body).toEqual([]);
            expect((await request(app).get('/api/games/bad;id/also-liked')).status).toBe(400);
        });
    });
});
