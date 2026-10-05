export const mapIGDBGame = (data) => {
    let coverUrl = data.cover?.url;
    if (coverUrl) {
        // IGDB returns protocol-relative URLs (//images.igdb.com/...)
        if (coverUrl.startsWith('//')) coverUrl = `https:${coverUrl}`;
        // t_cover_big is the standard portrait size
        coverUrl = coverUrl.replace('t_thumb', 't_cover_big');
    }

    return {
        _id: data.id, // The IGDB id doubles as _id until the game is saved locally
        igdbId: data.id,
        title: data.name,
        slug: data.slug,
        description: data.summary,
        coverImage: coverUrl,
        releaseDate: data.first_release_date ? new Date(data.first_release_date * 1000).toISOString() : null,
        averageRating: 0, // Only Hitbox's own reviews count towards ratings
        rating: 0,
        genre: data.genres?.map((g) => g.name) || [],
        platforms: data.platforms?.map((p) => p.name) || [],
        developer: data.involved_companies?.find((c) => c.developer)?.company?.name,
        publisher: data.involved_companies?.find((c) => c.publisher)?.company?.name,
        isRemote: true,
    };
};

const IGDB_IMAGES = 'https://images.igdb.com/igdb/image/upload';
// IGDB ids go into image and embed URLs, so only plain tokens are accepted.
const IMAGE_ID = /^[A-Za-z0-9_-]{3,40}$/;
const VIDEO_ID = /^[A-Za-z0-9_-]{6,20}$/;

const isTrailer = (video) => /trailer/i.test(video.name ?? '');

export const MAX_SCREENSHOTS = 12;
export const MAX_VIDEOS = 3;
export const MAX_SIMILAR = 12;

// Screenshots, trailers and similar games from an IGDB game record.
export const mapIGDBExtras = (data) => ({
    screenshots: (data.screenshots || [])
        .filter((s) => IMAGE_ID.test(s.image_id ?? ''))
        .slice(0, MAX_SCREENSHOTS)
        .map((s) => ({
            thumb: `${IGDB_IMAGES}/t_screenshot_med/${s.image_id}.jpg`,
            full: `${IGDB_IMAGES}/t_screenshot_big/${s.image_id}.jpg`,
        })),
    // IGDB videos are YouTube ids.
    // Trailers first: the page plays the first video, and IGDB lists diaries and clips among them.
    videos: (data.videos || [])
        .filter((v) => VIDEO_ID.test(v.video_id ?? ''))
        .sort((a, b) => Number(isTrailer(b)) - Number(isTrailer(a)))
        .slice(0, MAX_VIDEOS)
        .map((v) => ({ youtubeId: v.video_id, name: v.name || 'Trailer' })),
    similarGames: (data.similar_games || [])
        .filter((g) => g.id && g.name)
        .slice(0, MAX_SIMILAR)
        .map((g) => {
            const game = mapIGDBGame(g);
            return { _id: game._id, igdbId: game.igdbId, title: game.title, coverImage: game.coverImage };
        }),
});

// IGDB reports time to beat in seconds. Hours, rounded to the nearest half hour, read better.
export const secondsToHours = (seconds) => Math.max(0.5, Math.round(seconds / 1800) / 2);

// "Normally" is the typical playthrough; fall back to the quick one, then the completionist one.
export const mapTimeToBeat = (row) => {
    const seconds = row?.normally || row?.hastily || row?.completely;
    return seconds > 0 ? secondsToHours(seconds) : null;
};
