import { describe, expect, it } from 'vitest';
import { buildBrowseQuery, buildDetailQuery, quote } from '../src/services/igdbQuery.js';

describe('quote', () => {
    it('escapes quotes and backslashes so input stays inside the string', () => {
        expect(quote('zelda" ; where id = 1; "')).toBe('"zelda\\" ; where id = 1; \\""');
        expect(quote('a\\b')).toBe('"a\\\\b"');
    });

    it('flattens newlines', () => {
        expect(quote('a\nb')).toBe('"a b"');
    });
});

describe('buildBrowseQuery', () => {
    it('defaults to popularity ordering and the first page', () => {
        const query = buildBrowseQuery({});
        expect(query).toContain('limit 20; offset 0;');
        expect(query).toContain('sort total_rating_count desc;');
    });

    it('computes the offset from the page', () => {
        expect(buildBrowseQuery({ page: 3 })).toContain('offset 40;');
    });

    it('ignores unknown orderings, genres and platforms', () => {
        const query = buildBrowseQuery({ ordering: '-added', genres: 'nope', platforms: 'nope' });
        expect(query).toContain('sort total_rating_count desc;');
        expect(query).not.toContain('where');
    });

    it('maps shooter and action to different genres', () => {
        expect(buildBrowseQuery({ genres: 'Shooter' })).toContain('where genres = [5];');
        expect(buildBrowseQuery({ genres: 'action' })).toContain('where genres = (4,25);');
    });

    it('combines filters with &', () => {
        const query = buildBrowseQuery({ genres: 'rpg', platforms: 'pc', dates: '2020-01-01,2020-12-31' });
        expect(query).toContain(
            'where genres = [12] & platforms = [6] & first_release_date >= 1577836800 & first_release_date <= 1609372800;',
        );
    });

    it('drops unparseable dates', () => {
        expect(buildBrowseQuery({ dates: 'garbage,also garbage' })).not.toContain('first_release_date >=');
    });

    it('omits sort when searching, since IGDB rejects both', () => {
        const query = buildBrowseQuery({ search: 'halo', ordering: '-released' });
        expect(query).toContain('search "halo";');
        expect(query).not.toContain('sort');
    });

    it('cannot be broken out of through the search term', () => {
        const query = buildBrowseQuery({ search: '"; limit 500; "' });
        expect(query).toContain('search "\\"; limit 500; \\"";');
    });
});

describe('buildDetailQuery', () => {
    it('queries one id', () => {
        expect(buildDetailQuery('1942')).toContain('where id = 1942;');
    });

    it('rejects anything that is not a positive integer', () => {
        expect(() => buildDetailQuery('1; delete')).toThrow(TypeError);
        expect(() => buildDetailQuery('-3')).toThrow(TypeError);
        expect(() => buildDetailQuery('1.5')).toThrow(TypeError);
    });
});
