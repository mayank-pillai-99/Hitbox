import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

// These requests are all rejected before any handler touches MongoDB or IGDB,
// so they run without a database.
const app = createApp();
const token = (id = '64b7f0c2a1b2c3d4e5f60718') => jwt.sign({ user: { id } }, process.env.JWT_SECRET);

describe('server basics', () => {
    it('reports health', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });

    it('sets security headers', async () => {
        const res = await request(app).get('/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('returns JSON for unknown routes', async () => {
        const res = await request(app).get('/api/nope');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Route not found');
    });

    it('returns 400 for malformed JSON', async () => {
        const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{oops');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid JSON body');
    });
});

describe('authentication', () => {
    it('requires a token on protected routes', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('rejects an invalid token', async () => {
        const res = await request(app).get('/api/auth/me').set('x-auth-token', 'garbage');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Token is not valid');
    });

    it('rejects a token signed with another secret', async () => {
        const forged = jwt.sign({ user: { id: 'x' } }, 'some-other-secret-value');
        const res = await request(app).get('/api/auth/me').set('x-auth-token', forged);
        expect(res.status).toBe(401);
    });
});

describe('input validation', () => {
    it('rejects NoSQL operator objects at login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: { $ne: null }, password: { $ne: null } });
        expect(res.status).toBe(400);
    });

    it('rejects weak registrations', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'ab', email: 'nope', password: '1' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBeTruthy();
    });

    it('rejects out-of-range review ratings', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .set('x-auth-token', token())
            .send({ gameId: '1942', rating: 9 });
        expect(res.status).toBe(400);
    });

    it('rejects ids that are not Mongo ids', async () => {
        const res = await request(app).get('/api/lists/not-an-id');
        expect(res.status).toBe(400);
    });

    it('rejects invalid game status values', async () => {
        const res = await request(app)
            .post('/api/game-status')
            .set('x-auth-token', token())
            .send({ gameId: '1942', status: 'finished' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid status');
    });

    it('rejects non-numeric game ids before building an IGDB query', async () => {
        const res = await request(app).get('/api/games/1;%20limit%20500');
        expect(res.status).toBe(400);
    });
    it('requires login to follow, unfollow or read the feed', async () => {
        expect((await request(app).post('/api/users/bob/follow')).status).toBe(401);
        expect((await request(app).delete('/api/users/bob/follow')).status).toBe(401);
        expect((await request(app).get('/api/feed')).status).toBe(401);
    });

    it('rejects a malformed feed cursor', async () => {
        const res = await request(app).get('/api/feed?before=yesterday').set('x-auth-token', token());
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid date');
    });
});
