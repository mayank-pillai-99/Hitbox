import { describe, expect, it } from 'vitest';
import { containsPattern, escapeRegex, prefixPattern } from '../src/lib/regex.js';
import { buildBrowseQuery } from '../src/services/igdbQuery.js';
import * as schemas from '../src/schemas/index.js';

describe('escapeRegex', () => {
    it('escapes every regex metacharacter', () => {
        expect(escapeRegex('a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o')).toBe(
            'a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o',
        );
    });

    it('lets dangerous input match only itself', () => {
        expect(containsPattern('(a+)+$').test('xx(a+)+$yy')).toBe(true);
        expect(containsPattern('(a+)+$').test('aaaa')).toBe(false);
        expect(containsPattern('.*').test('anything')).toBe(false);
    });

    it('does not throw on unbalanced input', () => {
        expect(() => containsPattern('[')).not.toThrow();
        expect(() => prefixPattern('(')).not.toThrow();
    });
});

describe('patterns', () => {
    it('contains is case-insensitive and unanchored', () => {
        expect(containsPattern('rpg').test('Best RPGs of all time')).toBe(true);
    });

    it('prefix only matches the start', () => {
        expect(prefixPattern('da').test('Dana')).toBe(true);
        expect(prefixPattern('na').test('Dana')).toBe(false);
    });
});

describe('search schemas', () => {
    it('needs at least two characters and trims', () => {
        expect(schemas.search.query.safeParse({ q: 'a' }).success).toBe(false);
        expect(schemas.search.query.safeParse({ q: '  ' }).success).toBe(false);
        expect(schemas.search.query.parse({ q: ' zelda ' }).q).toBe('zelda');
        expect(schemas.search.query.safeParse({ q: 'x'.repeat(61) }).success).toBe(false);
    });

    it('rejects a non-string q (query-string injection)', () => {
        expect(schemas.search.query.safeParse({ q: { $ne: '' } }).success).toBe(false);
        expect(schemas.search.query.safeParse({ q: ['a', 'b'] }).success).toBe(false);
    });

    it('allows an optional q on members and lists', () => {
        expect(schemas.users.membersQuery.parse({}).q).toBeUndefined();
        expect(schemas.users.membersQuery.parse({ q: ' dana ' }).q).toBe('dana');
        expect(schemas.lists.discoverQuery.parse({ q: 'rpg' }).q).toBe('rpg');
        expect(schemas.lists.discoverQuery.safeParse({ q: 'x'.repeat(61) }).success).toBe(false);
    });
});

describe('browse query limit', () => {
    it('can ask IGDB for a handful of results', () => {
        expect(buildBrowseQuery({ search: 'halo', limit: 5 })).toContain('limit 5; offset 0;');
    });

    it('keeps the default page size and offsets', () => {
        expect(buildBrowseQuery({ page: 2 })).toContain('limit 20; offset 20;');
    });
});
