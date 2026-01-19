export const mapIGDBGame = (data) => {
    let coverUrl = data.cover?.url;
    if (coverUrl) {
        // IGDB returns protocol-relative URLs (//images.igdb.com/...)
        if (coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
        // Request higher resolution (t_cover_big is standard portrait)
        coverUrl = coverUrl.replace('t_thumb', 't_cover_big');
    }

    return {
        _id: data.id, // Use IGDB ID as _id for frontend consistency
        igdbId: data.id,
        title: data.name,
        slug: data.slug,
        description: data.summary,
        coverImage: coverUrl,
        releaseDate: data.first_release_date ? new Date(data.first_release_date * 1000).toISOString() : null,
        averageRating: 0, // Default to 0, strictly use local Hitbox data
        rating: 0, // Explicitly 0. Only local ratings (mapped in route) will populate this.
        genre: data.genres?.map(g => g.name) || [],
        platforms: data.platforms?.map(p => p.name) || [],
        developer: data.involved_companies?.find(c => c.developer)?.company?.name,
        publisher: data.involved_companies?.find(c => c.publisher)?.company?.name,
        isRemote: true
    };
};
