import { describe, expect, it } from 'vitest';
import { emptyStats, shapeStats } from '../src/services/gameStats.service.js';
import * as schemas from '../src/schemas/index.js';

describe('shapeStats', () => {
    it('returns zeros when there is nothing to count', () => {
        expect(shapeStats([], [])).toEqual(emptyStats());
        expect(emptyStats().average).toBe(0);
    });

    it('builds the histogram, count and rounded average', () => {
        const stats = shapeStats(
            [
                { _id: 5, count: 2 },
                { _id: 3, count: 1 },
            ],
            [],
        );
        expect(stats.histogram).toEqual({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 });
        expect(stats.count).toBe(3);
        expect(stats.average).toBe(4.3);
    });

    it('ignores ratings and statuses outside the known sets', () => {
        const stats = shapeStats([{ _id: 9, count: 4 }], [{ _id: 'finished', count: 2 }]);
        expect(stats.count).toBe(0);
        expect(stats.statuses).toEqual({ played: 0, playing: 0, want_to_play: 0 });
    });

    it('fills in status counts', () => {
        const stats = shapeStats(
            [],
            [
                { _id: 'played', count: 7 },
                { _id: 'want_to_play', count: 2 },
            ],
        );
        expect(stats.statuses).toEqual({ played: 7, playing: 0, want_to_play: 2 });
    });
});

describe('review schemas', () => {
    it('accepts the spoiler flag only as a boolean', () => {
        expect(schemas.reviews.create.safeParse({ gameId: '1', rating: 4, spoiler: true }).success).toBe(true);
        expect(schemas.reviews.create.safeParse({ gameId: '1', rating: 4, spoiler: 'yes' }).success).toBe(false);
        expect(schemas.reviews.update.safeParse({ spoiler: false }).success).toBe(true);
    });

    it('defaults review sorting to recent and rejects unknown sorts', () => {
        expect(schemas.reviews.gameQuery.parse({}).sort).toBe('recent');
        expect(schemas.reviews.gameQuery.parse({ sort: 'liked' }).sort).toBe('liked');
        expect(schemas.reviews.gameQuery.safeParse({ sort: 'random' }).success).toBe(false);
    });
});
