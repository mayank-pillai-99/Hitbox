import { describe, expect, it } from 'vitest';
import { bucket, fitScore, rankBacklog, summarize } from '../src/services/backlog.js';
import { mapTimeToBeat, secondsToHours } from '../src/lib/mappers.js';
import { buildTimeToBeatQuery } from '../src/services/igdbQuery.js';
import * as schemas from '../src/schemas/index.js';

describe('bucket', () => {
    it('sorts hours into short, medium and long', () => {
        expect(bucket(0.5)).toBe('short');
        expect(bucket(10)).toBe('short');
        expect(bucket(10.5)).toBe('medium');
        expect(bucket(30)).toBe('medium');
        expect(bucket(30.5)).toBe('long');
    });

    it('treats a missing length as unknown', () => {
        expect(bucket(null)).toBe('unknown');
        expect(bucket(undefined)).toBe('unknown');
    });
});

describe('fitScore', () => {
    const affinity = new Map([
        ['RPG', 1],
        ['Shooter', -1],
    ]);

    it('rewards genres the member likes and penalises ones they dislike', () => {
        const loved = fitScore({ genre: ['RPG'], averageRating: 0 }, affinity);
        const neutral = fitScore({ genre: ['Puzzle'], averageRating: 0 }, affinity);
        const disliked = fitScore({ genre: ['Shooter'], averageRating: 0 }, affinity);
        expect(loved).toBeGreaterThan(neutral);
        expect(neutral).toBeGreaterThan(disliked);
    });

    it('counts the community rating', () => {
        const high = fitScore({ genre: [], averageRating: 5 }, new Map());
        const low = fitScore({ genre: [], averageRating: 1 }, new Map());
        expect(high).toBeGreaterThan(low);
    });

    it('is neutral when nothing is known', () => {
        expect(fitScore({ genre: [], averageRating: 0 }, new Map())).toBeCloseTo(0.5);
        expect(fitScore({}, new Map())).toBeCloseTo(0.5);
    });

    it('stays between 0 and 1', () => {
        const best = fitScore({ genre: ['RPG'], averageRating: 5 }, affinity);
        const worst = fitScore({ genre: ['Shooter'], averageRating: 1 }, affinity);
        expect(best).toBeLessThanOrEqual(1);
        expect(worst).toBeGreaterThanOrEqual(0);
    });
});

describe('rankBacklog', () => {
    const affinity = new Map([['RPG', 1]]);
    const items = [
        { id: 'a', game: { genre: ['Puzzle'], averageRating: 0 }, hours: 5 },
        { id: 'b', game: { genre: ['RPG'], averageRating: 4.5 }, hours: 40 },
        { id: 'c', game: { genre: ['RPG'], averageRating: 0 }, hours: 12 },
        { id: 'd', game: { genre: [], averageRating: 0 }, hours: null },
    ];

    it('puts the best fit first and explains why', () => {
        const ranked = rankBacklog({ items, affinity });
        // a and d tie on fit, so the game with a known short length comes before the unknown one.
        expect(ranked.map((r) => r.id)).toEqual(['b', 'c', 'a', 'd']);
        expect(ranked[0].reason).toBe('Matches your taste for RPG, about 40 hours');
        expect(ranked[3].reason).toBe('In your backlog, length unknown');
    });

    it('filters by length, and hides unknown lengths unless asked for any', () => {
        expect(rankBacklog({ items, affinity, time: 'short' }).map((r) => r.id)).toEqual(['a']);
        expect(rankBacklog({ items, affinity, time: 'medium' }).map((r) => r.id)).toEqual(['c']);
        expect(rankBacklog({ items, affinity, time: 'long' }).map((r) => r.id)).toEqual(['b']);
    });

    it('prefers the quicker game when fit is equal', () => {
        const same = [
            { id: 'long', game: { genre: [], averageRating: 0 }, hours: 30 },
            { id: 'quick', game: { genre: [], averageRating: 0 }, hours: 4 },
        ];
        expect(rankBacklog({ items: same }).map((r) => r.id)).toEqual(['quick', 'long']);
    });

    it('is stable when everything ties', () => {
        const ties = [
            { id: 'z', game: {}, hours: null },
            { id: 'y', game: {}, hours: null },
        ];
        expect(rankBacklog({ items: ties }).map((r) => r.id)).toEqual(['y', 'z']);
    });

    it('does not change its input', () => {
        const copy = JSON.stringify(items);
        rankBacklog({ items, affinity });
        expect(JSON.stringify(items)).toBe(copy);
    });

    it('credits a highly rated game when no genre matches', () => {
        const [only] = rankBacklog({
            items: [{ id: 'x', game: { genre: ['Puzzle'], averageRating: 4.5 }, hours: 1 }],
            affinity,
        });
        expect(only.reason).toBe('Highly rated by members, about 1 hour');
    });
});

describe('summarize', () => {
    it('counts games, adds up known hours and counts unknown lengths', () => {
        expect(summarize([{ hours: 10 }, { hours: 2.5 }, { hours: null }])).toEqual({
            games: 3,
            hours: 12.5,
            unknown: 1,
        });
        expect(summarize([])).toEqual({ games: 0, hours: 0, unknown: 0 });
    });
});

describe('time to beat mapping', () => {
    it('converts seconds to the nearest half hour, never below half an hour', () => {
        expect(secondsToHours(254778)).toBe(71);
        expect(secondsToHours(5400)).toBe(1.5);
        expect(secondsToHours(60)).toBe(0.5);
    });

    it('prefers the normal playthrough, then the quick one, then the completionist one', () => {
        expect(mapTimeToBeat({ hastily: 3600, normally: 7200, completely: 36000 })).toBe(2);
        expect(mapTimeToBeat({ hastily: 3600, completely: 36000 })).toBe(1);
        expect(mapTimeToBeat({ completely: 36000 })).toBe(10);
    });

    it('is null when IGDB has nothing usable', () => {
        expect(mapTimeToBeat({})).toBeNull();
        expect(mapTimeToBeat(undefined)).toBeNull();
        expect(mapTimeToBeat({ normally: 0 })).toBeNull();
    });
});

describe('buildTimeToBeatQuery', () => {
    it('asks for the given games', () => {
        const query = buildTimeToBeatQuery([1942, 7346]);
        expect(query).toContain('where game_id = (1942,7346);');
        expect(query).toContain('limit 2;');
    });

    it('rejects anything that is not 1 to 100 positive integers', () => {
        expect(() => buildTimeToBeatQuery([])).toThrow(TypeError);
        expect(() => buildTimeToBeatQuery(['1) | (2'])).toThrow(TypeError);
        expect(() => buildTimeToBeatQuery([0])).toThrow(TypeError);
        expect(() => buildTimeToBeatQuery(Array.from({ length: 101 }, (_, i) => i + 1))).toThrow(TypeError);
    });
});

describe('backlog query schema', () => {
    it('defaults to any and rejects unknown lengths', () => {
        expect(schemas.backlog.query.parse({}).time).toBe('any');
        expect(schemas.backlog.query.parse({ time: 'short' }).time).toBe('short');
        expect(schemas.backlog.query.safeParse({ time: 'forever' }).success).toBe(false);
    });
});
