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
