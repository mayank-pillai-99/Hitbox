import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import Game from '../src/models/Game.js';

// Needs a MongoDB that can be wiped: MONGO_TEST_URI=mongodb://127.0.0.1:27017/hitbox-test npm test
// IGDB is never called; games are seeded straight into the database.
describe.skipIf(!process.env.MONGO_TEST_URI)('API with MongoDB', () => {
    const app = createApp();
    const password = 'correct-horse-battery';
    let alice;
    let bob;
    let games;

    const register = async (username) => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username, email: `${username}@example.com`, password });
        expect(res.status).toBe(200);
        return { username, token: res.body.token };
    };
    const as = (user) => ({ 'x-auth-token': user.token });

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
        await mongoose.connection.dropDatabase();
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
        games = await Game.create([
            { igdbId: 1, title: 'Celeste' },
            { igdbId: 2, title: 'Hades' },
            { igdbId: 3, title: 'Tunic' },
        ]);
        alice = await register('alice');
        bob = await register('bob');
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('accounts', () => {
        it('rejects duplicate emails and usernames', async () => {
            const dupEmail = await request(app)
                .post('/api/auth/register')
                .send({ username: 'other', email: 'alice@example.com', password });
            expect(dupEmail.status).toBe(400);
            const dupName = await request(app)
                .post('/api/auth/register')
                .send({ username: 'alice', email: 'new@example.com', password });
            expect(dupName.status).toBe(400);
            expect(dupName.body.message).toBe('Username taken');
        });

        it('logs in with the right password only', async () => {
            const ok = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password });
            expect(ok.status).toBe(200);
            const bad = await request(app)
                .post('/api/auth/login')
                .send({ email: 'alice@example.com', password: 'wrong-password' });
            expect(bad.status).toBe(400);
            expect(bad.body.message).toBe('Invalid credentials');
        });

        it('never exposes the password hash or email on public profiles', async () => {
            const res = await request(app).get('/api/users/alice');
            expect(res.status).toBe(200);
            expect(res.body.password).toBeUndefined();
            expect(res.body.email).toBeUndefined();
        });
    });

    describe('reviews', () => {
        it('averages ratings onto the game, once per user', async () => {
            const first = await request(app)
                .post('/api/reviews')
                .set(as(alice))
                .send({ gameId: String(games[0]._id), rating: 5, text: 'Great' });
            expect(first.status).toBe(200);
            const second = await request(app)
                .post('/api/reviews')
                .set(as(bob))
                .send({ gameId: String(games[0]._id), rating: 2 });
            expect(second.status).toBe(200);

            expect((await Game.findById(games[0]._id)).averageRating).toBe(3.5);

            const dup = await request(app)
                .post('/api/reviews')
                .set(as(bob))
                .send({ gameId: String(games[0]._id), rating: 4 });
            expect(dup.status).toBe(409);
            expect(dup.body.message).toBe('Already reviewed');
        });

        it('resolves IGDB ids to local games and lists the reviews', async () => {
            const res = await request(app).get('/api/reviews/game/1');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect((await request(app).get('/api/reviews/game/999')).body).toEqual([]);
        });

        it('recomputes the rating when a review changes or is deleted', async () => {
            const [mine] = (await request(app).get('/api/reviews/my').set(as(bob))).body;
            await request(app).put(`/api/reviews/${mine._id}`).set(as(bob)).send({ rating: 4 });
            expect((await Game.findById(games[0]._id)).averageRating).toBe(4.5);
            await request(app).delete(`/api/reviews/${mine._id}`).set(as(bob));
            expect((await Game.findById(games[0]._id)).averageRating).toBe(5);
        });

        it("won't let one user edit another's review", async () => {
            const [mine] = (await request(app).get('/api/reviews/my').set(as(alice))).body;
            const res = await request(app).put(`/api/reviews/${mine._id}`).set(as(bob)).send({ rating: 1 });
            expect(res.status).toBe(404);
        });

        it('likes are idempotent and can be removed', async () => {
            const [review] = (await request(app).get('/api/reviews/my').set(as(alice))).body;
            await request(app).post(`/api/reviews/${review._id}/like`).set(as(bob));
            const again = await request(app).post(`/api/reviews/${review._id}/like`).set(as(bob));
            expect(again.body.likesCount).toBe(1);
            const removed = await request(app).delete(`/api/reviews/${review._id}/like`).set(as(bob));
            expect(removed.body.likesCount).toBe(0);
        });
    });

    describe('game status and profile stats', () => {
        it('counts played games in the profile stats', async () => {
            await request(app).post('/api/game-status').set(as(alice)).send({ gameId: '1', status: 'played' });
            await request(app).post('/api/game-status').set(as(alice)).send({ gameId: '2', status: 'playing' });

            const counts = await request(app).get('/api/game-status/counts').set(as(alice));
            expect(counts.body).toEqual({ played: 1, playing: 1, want_to_play: 0, total: 2 });

            const me = await request(app).get('/api/auth/me').set(as(alice));
            expect(me.body.stats).toEqual({ reviews: 1, lists: 0, gamesPlayed: 1 });
            expect(me.body.password).toBeUndefined();
        });

        it('reports no status for games not saved locally', async () => {
            const res = await request(app).get('/api/game-status/game/999').set(as(alice));
            expect(res.body).toEqual({ status: null });
        });
    });

    describe('lists', () => {
        let big;
        let small;

        it('creates lists and rejects duplicate names', async () => {
            big = (await request(app).post('/api/lists').set(as(alice)).send({ name: 'Big', description: 'many' }))
                .body;
            small = (await request(app).post('/api/lists').set(as(bob)).send({ name: 'Small' })).body;
            const dup = await request(app).post('/api/lists').set(as(alice)).send({ name: 'Big' });
            expect(dup.status).toBe(409);
            const blank = await request(app).post('/api/lists').set(as(alice)).send({ name: '  ' });
            expect(blank.status).toBe(400);
        });

        it('adds games once and only to your own list', async () => {
            for (const game of games) {
                const res = await request(app)
                    .post(`/api/lists/${big._id}/add`)
                    .set(as(alice))
                    .send({ gameId: String(game._id) });
                expect(res.status).toBe(200);
            }
            await request(app).post(`/api/lists/${small._id}/add`).set(as(bob)).send({ gameId: '1' });

            const dup = await request(app).post(`/api/lists/${big._id}/add`).set(as(alice)).send({ gameId: '1' });
            expect(dup.status).toBe(409);
            expect(dup.body.message).toBe('Game already in list');

            const foreign = await request(app).post(`/api/lists/${big._id}/add`).set(as(bob)).send({ gameId: '2' });
            expect(foreign.status).toBe(404);
        });

        it('ranks discovery by game count across all lists', async () => {
            const res = await request(app).get('/api/lists/discover?limit=1');
            expect(res.body.lists).toHaveLength(1);
            expect(res.body.lists[0]).toMatchObject({ name: 'Big', gameCount: 3, user: { username: 'alice' } });
            expect(res.body.lists[0].previewGames.map((g) => g.title)).toEqual(['Celeste', 'Hades', 'Tunic']);
            expect(res.body.pagination).toEqual({ current: 1, total: 2, count: 2 });

            const page2 = await request(app).get('/api/lists/discover?limit=1&page=2');
            expect(page2.body.lists[0].name).toBe('Small');
        });

        it('counts comments on discovery and removes them with the list', async () => {
            await request(app).post(`/api/comments/list/${big._id}`).set(as(bob)).send({ text: 'Nice list' });
            const discover = await request(app).get('/api/lists/discover');
            expect(discover.body.lists.find((l) => l.name === 'Big').commentCount).toBe(1);

            const tooLong = await request(app)
                .post(`/api/comments/list/${big._id}`)
                .set(as(bob))
                .send({ text: 'x'.repeat(1001) });
            expect(tooLong.status).toBe(400);
        });

        it('does not leak the owner password when removing a game', async () => {
            const res = await request(app).delete(`/api/lists/${big._id}/game/${games[2]._id}`).set(as(alice));
            expect(res.status).toBe(200);
            expect(res.body.games).toHaveLength(2);
            expect(res.body.user.password).toBeUndefined();
            expect(res.body.user.email).toBeUndefined();
        });

        it('deletes a list together with its comments', async () => {
            const res = await request(app).delete(`/api/lists/${big._id}`).set(as(alice));
            expect(res.status).toBe(200);
            expect(await mongoose.model('Comment').countDocuments({ list: big._id })).toBe(0);
        });
    });

    describe('members', () => {
        it('lists members with counts and recent games', async () => {
            const res = await request(app).get('/api/users?sort=reviews');
            expect(res.status).toBe(200);
            const alicesCard = res.body.members.find((m) => m.username === 'alice');
            expect(alicesCard.stats).toEqual({ reviews: 1, lists: 0, gamesPlayed: 1 });
            expect(alicesCard.recentGames).toEqual([{ title: 'Celeste', coverImage: undefined }]);
            expect(alicesCard.password).toBeUndefined();
            expect(alicesCard.email).toBeUndefined();
            expect(res.body.members[0].username).toBe('alice');
            expect(res.body.pagination.count).toBe(2);
        });

        it('paginates user reviews and 404s unknown users', async () => {
            const res = await request(app).get('/api/users/alice/reviews');
            expect(res.body.reviews).toHaveLength(1);
            expect((await request(app).get('/api/users/nobody/reviews')).status).toBe(404);
        });

        it('serves site stats', async () => {
            const res = await request(app).get('/api/stats');
            expect(res.body).toEqual({ games: 3, reviews: 1, lists: 1, members: 2 });
        });
    });
});
