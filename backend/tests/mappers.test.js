import { describe, expect, it } from 'vitest';
import { mapIGDBGame } from '../src/lib/mappers.js';

describe('mapIGDBGame', () => {
    it('maps IGDB fields to the app shape', () => {
        const game = mapIGDBGame({
            id: 7,
            name: 'Celeste',
            slug: 'celeste',
            summary: 'Climb.',
            cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg' },
            first_release_date: 1516838400,
            genres: [{ name: 'Platform' }],
            platforms: [{ name: 'PC' }],
            involved_companies: [
                { developer: true, publisher: false, company: { name: 'Maddy Makes Games' } },
                { developer: false, publisher: true, company: { name: 'Extremely OK Games' } },
            ],
        });

        expect(game).toMatchObject({
            _id: 7,
            igdbId: 7,
            title: 'Celeste',
            coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/abc.jpg',
            releaseDate: '2018-01-25T00:00:00.000Z',
            genre: ['Platform'],
            platforms: ['PC'],
            developer: 'Maddy Makes Games',
            publisher: 'Extremely OK Games',
            rating: 0,
            isRemote: true,
        });
    });

    it('copes with missing optional fields', () => {
        const game = mapIGDBGame({ id: 1, name: 'Bare' });
        expect(game.coverImage).toBeUndefined();
        expect(game.releaseDate).toBeNull();
        expect(game.genre).toEqual([]);
        expect(game.developer).toBeUndefined();
    });
});
