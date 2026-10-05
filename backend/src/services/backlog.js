// Ranking for the backlog planner. Pure functions over plain data, so it can be tested without a database.
// The member's backlog is their want-to-play list; each game is scored by how well it fits their taste
// and placed in a length bucket from its hours to beat.

export const SHORT_MAX_HOURS = 10;
export const MEDIUM_MAX_HOURS = 30;

export const bucket = (hours) => {
    if (hours === null || hours === undefined) return 'unknown';
    if (hours <= SHORT_MAX_HOURS) return 'short';
    if (hours <= MEDIUM_MAX_HOURS) return 'medium';
    return 'long';
};

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// 0 to 1. Taste (the genres of games the member rates highly) counts a bit more than the community rating.
// With nothing known about either, a game scores 0.5, so it neither leads nor trails.
export const fitScore = (game, affinity) => {
    const genres = game.genre ?? [];
    const taste =
        genres.length && affinity.size
            ? clamp01((genres.reduce((sum, g) => sum + (affinity.get(g) ?? 0), 0) / genres.length + 1) / 2)
            : 0.5;
    const community = game.averageRating > 0 ? clamp01(game.averageRating / 5) : 0.5;
    return 0.6 * taste + 0.4 * community;
};

const formatHours = (hours) => (hours === null ? 'length unknown' : `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`);

const reasonFor = (game, hours, affinity) => {
    const best = (game.genre ?? [])
        .filter((g) => (affinity.get(g) ?? 0) > 0)
        .sort((a, b) => affinity.get(b) - affinity.get(a))[0];
    let lead = 'In your backlog';
    if (best) lead = `Matches your taste for ${best}`;
    else if (game.averageRating >= 4) lead = 'Highly rated by members';
    return `${lead}, ${formatHours(hours)}`;
};

// items: [{ id, game: { genre, averageRating }, hours: number | null }]
// time: 'any' | 'short' | 'medium' | 'long'. Games of unknown length only appear under 'any'.
export const rankBacklog = ({ items, affinity = new Map(), time = 'any' }) =>
    items
        .filter((item) => time === 'any' || bucket(item.hours) === time)
        .map((item) => ({
            ...item,
            fit: Math.round(fitScore(item.game, affinity) * 100) / 100,
            reason: reasonFor(item.game, item.hours, affinity),
        }))
        // Best fit first; for equal fit, the quicker game; then id so the order is stable.
        .sort(
            (a, b) =>
                b.fit - a.fit ||
                (a.hours ?? Infinity) - (b.hours ?? Infinity) ||
                String(a.id).localeCompare(String(b.id)),
        );

// The whole backlog, regardless of filter: how many games, how many hours to clear, how many have no length.
export const summarize = (items) => ({
    games: items.length,
    hours: items.reduce((sum, item) => sum + (item.hours ?? 0), 0),
    unknown: items.filter((item) => item.hours === null || item.hours === undefined).length,
});
