import { describe, expect, it } from 'vitest';
import { compareTaste, confidenceFor } from '../src/services/tasteMatch.js';

const m = (obj) => new Map(Object.entries(obj));

describe('compareTaste', () => {
    it('reports no overlap', () => {
        expect(compareTaste(m({ a: 5 }), m({ b: 5 }))).toEqual({
            shared: 0,
            percent: null,
            confidence: 'none',
            bothLoved: [],
            disagree: [],
        });
        expect(compareTaste(new Map(), new Map()).shared).toBe(0);
    });

    it('is 100 percent when every shared rating is identical', () => {
        expect(compareTaste(m({ a: 5, b: 2 }), m({ a: 5, b: 2 })).percent).toBe(100);
    });

    it('is 0 percent at the furthest possible disagreement', () => {
        expect(compareTaste(m({ a: 5 }), m({ a: 1 })).percent).toBe(0);
    });

    it('averages the gaps', () => {
        // gaps 0 and 2 -> mean 1 -> 75
        expect(compareTaste(m({ a: 4, b: 4 }), m({ a: 4, b: 2 })).percent).toBe(75);
    });

    it('only counts games both have rated', () => {
        const result = compareTaste(m({ a: 5, only_mine: 1 }), m({ a: 5, only_theirs: 1 }));
        expect(result.shared).toBe(1);
        expect(result.percent).toBe(100);
    });

    it('lists games both loved, strongest first', () => {
        const result = compareTaste(m({ a: 4, b: 5, c: 5, d: 3 }), m({ a: 4, b: 5, c: 4, d: 5 }));
        expect(result.bothLoved.map((s) => s.game)).toEqual(['b', 'c', 'a']);
        expect(result.bothLoved[0]).toEqual({ game: 'b', mine: 5, theirs: 5 });
    });

    it('lists disagreements of two or more points, biggest first', () => {
        const result = compareTaste(m({ a: 5, b: 3, c: 4 }), m({ a: 1, b: 1, c: 3 }));
        expect(result.disagree.map((s) => s.game)).toEqual(['a', 'b']);
    });

    it('keeps the order stable when everything ties', () => {
        const result = compareTaste(m({ z: 5, y: 5 }), m({ z: 5, y: 5 }));
        expect(result.bothLoved.map((s) => s.game)).toEqual(['y', 'z']);
    });
});

describe('confidenceFor', () => {
    it('grows with the number of shared games', () => {
        expect([0, 1, 2, 3, 5, 6, 20].map(confidenceFor)).toEqual([
            'none',
            'low',
            'low',
            'medium',
            'medium',
            'high',
            'high',
        ]);
    });
});
