import { describe, expect, it } from 'vitest';
import { scoreTrending } from '../src/services/trending.service.js';
import { buildPopularityQuery, buildTrendingDetailsQuery } from '../src/services/igdbQuery.js';

describe('scoreTrending', () => {
    it('follows IGDB order when Hitbox has no activity', () => {
        expect(scoreTrending([10, 20, 30], new Map()).map((r) => r.id)).toEqual([10, 20, 30]);
    });

    it('lets weekly Hitbox activity lift a game above more-visited ones', () => {
        const ranked = scoreTrending([10, 20, 30], new Map([[30, 4]]));
        expect(ranked.map((r) => r.id)).toEqual([30, 10, 20]);
    });

    it('caps the community boost, so one busy game cannot dominate forever', () => {
        const small = scoreTrending([10], new Map([[10, 3]]))[0].score;
        const huge = scoreTrending([10], new Map([[10, 300]]))[0].score;
        expect(huge).toBe(small);
    });

    it('includes games Hitbox is busy with even if IGDB does not list them', () => {
        const ranked = scoreTrending([10, 20], new Map([[99, 3]]));
        expect(ranked.map((r) => r.id)).toContain(99);
        expect(ranked.find((r) => r.id === 99).score).toBe(1);
    });

    it('breaks ties by id so the order is stable', () => {
        const ranked = scoreTrending(
            [],
            new Map([
                [7, 3],
                [5, 3],
            ]),
        );
        expect(ranked.map((r) => r.id)).toEqual([5, 7]);
    });

    it('handles nothing at all', () => {
        expect(scoreTrending([], new Map())).toEqual([]);
    });
});

describe('trending queries', () => {
    it('asks IGDB for the most visited games', () => {
        const query = buildPopularityQuery(40);
        expect(query).toContain('popularity_type = 1');
        expect(query).toContain('sort value desc');
        expect(query).toContain('limit 40;');
    });

    it('rejects a bad popularity limit', () => {
        expect(() => buildPopularityQuery('40; drop')).toThrow(TypeError);
        expect(() => buildPopularityQuery(0)).toThrow(TypeError);
        expect(() => buildPopularityQuery(1000)).toThrow(TypeError);
    });

    it('only returns released games with a cover', () => {
        const query = buildTrendingDetailsQuery([1, 2, 3], 1_700_000_000.9);
        expect(query).toContain('where id = (1,2,3)');
        expect(query).toContain('cover != null');
        expect(query).toContain('first_release_date <= 1700000000');
        expect(query).toContain('limit 3;');
    });

    it('rejects ids that are not positive integers, and an empty list', () => {
        expect(() => buildTrendingDetailsQuery(['1) | (2'], 1)).toThrow(TypeError);
        expect(() => buildTrendingDetailsQuery([-1], 1)).toThrow(TypeError);
        expect(() => buildTrendingDetailsQuery([], 1)).toThrow(TypeError);
        expect(() => buildTrendingDetailsQuery([1], 'soon')).toThrow(TypeError);
    });
});
