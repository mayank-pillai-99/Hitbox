import { describe, expect, it } from 'vitest';
import * as schemas from '../src/schemas/index.js';

const objectId = '64b7f0c2a1b2c3d4e5f60718';

describe('auth schemas', () => {
    it('accepts a valid registration', () => {
        const result = schemas.auth.register.safeParse({
            username: 'mayank_p',
            email: ' a@b.co ',
            password: 'longenough',
        });
        expect(result.success).toBe(true);
        expect(result.data.email).toBe('a@b.co');
    });

    it('rejects short passwords and bad usernames', () => {
        expect(
            schemas.auth.register.safeParse({ username: 'ok_name', email: 'a@b.co', password: 'short' }).success,
        ).toBe(false);
        expect(
            schemas.auth.register.safeParse({ username: 'no spaces', email: 'a@b.co', password: 'longenough' }).success,
        ).toBe(false);
    });

    it('rejects operator objects in login fields (NoSQL injection)', () => {
        expect(schemas.auth.login.safeParse({ email: { $ne: null }, password: { $ne: null } }).success).toBe(false);
    });

    it('rejects non-http profile pictures', () => {
        expect(schemas.auth.updateProfile.safeParse({ profilePicture: 'javascript:alert(1)' }).success).toBe(false);
        expect(schemas.auth.updateProfile.safeParse({ profilePicture: 'https://example.com/a.png' }).success).toBe(
            true,
        );
        expect(schemas.auth.updateProfile.safeParse({ profilePicture: '' }).success).toBe(true);
    });
});

describe('gameRef', () => {
    it('accepts Mongo ids and IGDB ids, normalised to strings', () => {
        expect(schemas.games.params.parse({ id: objectId }).id).toBe(objectId);
        expect(schemas.games.params.parse({ id: '1942' }).id).toBe('1942');
    });

    it('rejects everything else', () => {
        expect(schemas.games.params.safeParse({ id: '1942; drop' }).success).toBe(false);
        expect(schemas.games.params.safeParse({ id: '-1' }).success).toBe(false);
        expect(schemas.games.params.safeParse({ id: '9999999999' }).success).toBe(false);
        expect(schemas.games.params.safeParse({ id: '2147483647' }).success).toBe(true);
    });
});

describe('games query', () => {
    it('defaults the page and strips unknown keys such as page_size', () => {
        expect(schemas.games.query.parse({ page_size: '500' })).toEqual({ page: 1 });
    });

    it('keeps unknown orderings so the query builder can fall back', () => {
        expect(schemas.games.query.parse({ ordering: '-added' }).ordering).toBe('-added');
    });
});

describe('reviews', () => {
    it('requires a whole-number rating from 1 to 5', () => {
        const base = { gameId: '1942' };
        expect(schemas.reviews.create.safeParse({ ...base, rating: 5 }).success).toBe(true);
        expect(schemas.reviews.create.safeParse({ ...base, rating: 0 }).success).toBe(false);
        expect(schemas.reviews.create.safeParse({ ...base, rating: 6 }).success).toBe(false);
        expect(schemas.reviews.create.safeParse({ ...base, rating: 3.5 }).success).toBe(false);
        expect(schemas.reviews.create.safeParse({ ...base, rating: '4' }).success).toBe(false);
    });
});

describe('pagination limits', () => {
    it('caps page size', () => {
        expect(schemas.lists.discoverQuery.safeParse({ limit: '1000' }).success).toBe(false);
        expect(schemas.lists.discoverQuery.parse({}).limit).toBe(20);
    });
});

describe('lists', () => {
    it('requires a non-blank name', () => {
        expect(schemas.lists.create.safeParse({ name: '   ' }).success).toBe(false);
        expect(schemas.lists.create.parse({ name: ' Best RPGs ' }).name).toBe('Best RPGs');
    });
});
