import { describe, expect, it } from 'vitest';
import { mergeActivity } from '../src/services/feed.service.js';
import * as schemas from '../src/schemas/index.js';

const item = (id, iso) => ({ _id: id, createdAt: new Date(iso) });

describe('mergeActivity', () => {
    const items = [item('a', '2024-01-01'), item('d', '2024-01-04'), item('b', '2024-01-02'), item('c', '2024-01-03')];

    it('orders newest first across sources', () => {
        expect(mergeActivity(items, 10).items.map((i) => i._id)).toEqual(['d', 'c', 'b', 'a']);
    });

    it('has no next page when everything fits', () => {
        expect(mergeActivity(items, 4).nextBefore).toBeNull();
        expect(mergeActivity([], 4)).toEqual({ items: [], nextBefore: null });
    });

    it('trims to the limit and points the cursor at the last returned item', () => {
        const page = mergeActivity(items, 2);
        expect(page.items.map((i) => i._id)).toEqual(['d', 'c']);
        expect(page.nextBefore).toEqual(new Date('2024-01-03'));
    });

    it('breaks ties by id so the order is stable', () => {
        const tied = [item('1', '2024-01-01'), item('2', '2024-01-01')];
        expect(mergeActivity(tied, 5).items.map((i) => i._id)).toEqual(['2', '1']);
    });

    it('does not mutate its input', () => {
        const copy = [...items];
        mergeActivity(items, 2);
        expect(items).toEqual(copy);
    });
});

describe('feed query schema', () => {
    it('defaults the limit and accepts an ISO cursor', () => {
        const parsed = schemas.feed.query.parse({ before: '2024-01-03T00:00:00.000Z' });
        expect(parsed.limit).toBe(20);
        expect(parsed.before).toEqual(new Date('2024-01-03T00:00:00.000Z'));
    });

    it('rejects a bad cursor or an oversized page', () => {
        expect(schemas.feed.query.safeParse({ before: 'yesterday' }).success).toBe(false);
        expect(schemas.feed.query.safeParse({ limit: '500' }).success).toBe(false);
    });
});
