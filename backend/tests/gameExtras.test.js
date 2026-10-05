import { describe, expect, it } from 'vitest';
import { mapIGDBExtras, MAX_SCREENSHOTS } from '../src/lib/mappers.js';
import { buildExtrasQuery } from '../src/services/igdbQuery.js';

describe('buildExtrasQuery', () => {
    it('asks for screenshots, videos and similar games of one game', () => {
        const query = buildExtrasQuery('1942');
        expect(query).toContain('screenshots.image_id');
        expect(query).toContain('videos.video_id');
        expect(query).toContain('similar_games.name');
        expect(query).toContain('where id = 1942;');
    });

    it('rejects ids that are not positive integers', () => {
        expect(() => buildExtrasQuery('1; limit 500')).toThrow(TypeError);
        expect(() => buildExtrasQuery('0')).toThrow(TypeError);
    });
});

describe('mapIGDBExtras', () => {
    const record = {
        screenshots: [{ image_id: 'sc6abc' }, { image_id: 'sc7def' }],
        videos: [{ video_id: 'dQw4w9WgXcQ', name: 'Launch Trailer' }, { video_id: 'abc123xyz' }],
        similar_games: [
            { id: 7, name: 'Hollow Knight', cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/co1.jpg' } },
            { id: 8, name: 'No Cover' },
        ],
    };

    it('builds image, video and similar-game entries', () => {
        const extras = mapIGDBExtras(record);
        expect(extras.screenshots[0]).toEqual({
            thumb: 'https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc6abc.jpg',
            full: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6abc.jpg',
        });
        expect(extras.videos).toEqual([
            { youtubeId: 'dQw4w9WgXcQ', name: 'Launch Trailer' },
            { youtubeId: 'abc123xyz', name: 'Trailer' },
        ]);
        expect(extras.similarGames[0]).toEqual({
            _id: 7,
            igdbId: 7,
            title: 'Hollow Knight',
            coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg',
        });
        expect(extras.similarGames[1].coverImage).toBeUndefined();
    });

    it('returns empty lists when IGDB has none', () => {
        expect(mapIGDBExtras({})).toEqual({ screenshots: [], videos: [], similarGames: [] });
    });

    it('drops ids that could break out of a URL', () => {
        const extras = mapIGDBExtras({
            screenshots: [{ image_id: '../../evil' }, { image_id: 'ok123' }],
            videos: [{ video_id: 'x"onload="alert(1)' }, { video_id: '<script>' }],
        });
        expect(extras.screenshots).toHaveLength(1);
        expect(extras.videos).toEqual([]);
    });

    it('caps the number of screenshots', () => {
        const screenshots = Array.from({ length: 40 }, (_, i) => ({ image_id: `img${i}abc` }));
        expect(mapIGDBExtras({ screenshots }).screenshots).toHaveLength(MAX_SCREENSHOTS);
    });
});
