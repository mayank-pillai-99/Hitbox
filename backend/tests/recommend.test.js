import { describe, expect, it } from 'vitest';
import { collaborativeScores, genreAffinity, popularityScore, rank, similarity } from '../src/services/recommend.js';

const ratings = (obj) => new Map(Object.entries(obj));

describe('similarity', () => {
    it('is zero without shared games', () => {
        expect(similarity(ratings({ a: 5 }), ratings({ b: 5 }))).toBe(0);
    });

    it('is zero for opposite ratings', () => {
        expect(similarity(ratings({ a: 5 }), ratings({ a: 1 }))).toBe(0);
    });

    it('trusts one shared game less than several', () => {
        const one = similarity(ratings({ a: 5 }), ratings({ a: 5 }));
        const two = similarity(ratings({ a: 5, b: 4 }), ratings({ a: 5, b: 4 }));
        expect(one).toBeCloseTo(1 / 3);
        expect(two).toBeCloseTo(0.5);
        expect(two).toBeGreaterThan(one);
    });

    it('drops with disagreement', () => {
        const close = similarity(ratings({ a: 5, b: 4 }), ratings({ a: 5, b: 3 }));
        const far = similarity(ratings({ a: 5, b: 4 }), ratings({ a: 2, b: 1 }));
        expect(close).toBeGreaterThan(far);
    });
});

describe('collaborativeScores', () => {
    const mine = ratings({ g1: 5 });

    it('weights votes by similarity and skips games the member already rated', () => {
        const scores = collaborativeScores(mine, [
            { ratings: ratings({ g1: 5, g2: 5 }), similarity: 0.8 },
            { ratings: ratings({ g2: 4 }), similarity: 0.4 },
        ]);
        expect(scores.has('g1')).toBe(false);
        expect(scores.get('g2').score).toBeCloseTo(1.0);
        expect(scores.get('g2').supporters).toBe(2);
    });

    it('lets a low rating vote against a game, and drops games with no net support', () => {
        const scores = collaborativeScores(mine, [
            { ratings: ratings({ g3: 2 }), similarity: 0.8 },
            { ratings: ratings({ g3: 4 }), similarity: 0.4 },
        ]);
        expect(scores.has('g3')).toBe(false);
    });

    it('ignores neighbours with no similarity', () => {
        expect(collaborativeScores(mine, [{ ratings: ratings({ g2: 5 }), similarity: 0 }]).size).toBe(0);
    });
});

describe('genreAffinity', () => {
    it('likes genres of highly rated games and dislikes those of low rated ones', () => {
        const affinity = genreAffinity(
            ratings({ a: 5, b: 1, c: 3 }),
            new Map([
                ['a', ['RPG']],
                ['b', ['Shooter']],
                ['c', ['RPG', 'Puzzle']],
            ]),
        );
        expect(affinity.get('RPG')).toBe(1);
        expect(affinity.get('Shooter')).toBe(-1);
        expect(affinity.get('Puzzle')).toBe(0);
    });

    it('is empty when there is nothing to learn from', () => {
        expect(genreAffinity(ratings({ a: 3 }), new Map([['a', ['RPG']]])).size).toBe(0);
        expect(genreAffinity(new Map(), new Map()).size).toBe(0);
    });
});

describe('rank', () => {
    const base = () => ({
        mine: ratings({ m1: 5 }),
        genresByGame: new Map([['m1', ['RPG']]]),
        neighbours: [{ ratings: ratings({ m1: 5, x: 5, y: 4 }), similarity: 0.8 }],
        candidates: new Map([
            ['x', { genre: ['RPG'] }],
            ['y', { genre: ['Shooter'] }],
            ['z', { genre: ['RPG'] }],
            ['w', { genre: ['Puzzle'] }],
        ]),
        similarTo: new Map([['s', 'Celeste']]),
    });

    it('combines the three signals and orders by score', () => {
        const result = rank(base());
        expect(result.map((r) => r.id)).toEqual(['x', 'z', 's', 'y']);
        expect(result[0].score).toBe(1.6);
    });

    it('explains each pick', () => {
        const byId = Object.fromEntries(rank(base()).map((r) => [r.id, r.reasons]));
        expect(byId.x).toEqual(['Members with similar taste rated it highly', 'Matches your taste for RPG']);
        expect(byId.s).toEqual(['Similar to Celeste']);
        expect(byId.z).toEqual(['Matches your taste for RPG']);
        expect(byId.y).toEqual(['Members with similar taste rated it highly']);
    });

    it('leaves out games with no signal', () => {
        expect(rank(base()).some((r) => r.id === 'w')).toBe(false);
    });

    it('never suggests games the member rated or tracks', () => {
        const result = rank({ ...base(), tracked: new Set(['z']) });
        expect(result.map((r) => r.id)).not.toContain('z');
        expect(result.map((r) => r.id)).not.toContain('m1');
    });

    it('respects the limit', () => {
        expect(rank({ ...base(), limit: 2 }).map((r) => r.id)).toEqual(['x', 'z']);
    });

    it('returns nothing for a member nothing can be learned about', () => {
        expect(rank({ mine: new Map(), neighbours: [], candidates: new Map(), genresByGame: new Map() })).toEqual([]);
    });
});

describe('popularityScore', () => {
    it('does not let one perfect rating beat many good ones', () => {
        const oneFive = popularityScore({ average: 5, count: 1 });
        const manyFours = popularityScore({ average: 4, count: 20 });
        expect(manyFours).toBeGreaterThan(oneFive);
    });

    it('pulls unrated games towards the middle', () => {
        expect(popularityScore({ average: 0, count: 0 })).toBe(3);
    });
});
