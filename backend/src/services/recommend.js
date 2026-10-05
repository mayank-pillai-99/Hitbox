// Scoring for "recommended for you". Pure functions over plain data (Maps keyed by id strings),
// so the ranking can be tested without a database. recommendations.service.js loads the data.
//
// Three signals, each explainable to the member:
//   1. members with similar taste rated the game highly (collaborative filtering)
//   2. the game's genres match genres the member rates highly
//   3. IGDB lists it as similar to a game the member liked

export const LIKED = 4; // ratings from here up count as "liked"
const centered = (rating) => (rating - 3) / 2; // 5 -> +1, 3 -> 0, 1 -> -1

export const WEIGHTS = { collaborative: 1, genre: 0.6, similar: 0.5 };

// How alike two members rate: 1 = identical on every shared game, 0 = opposite.
// Few shared games count for less, so one coincidence isn't mistaken for shared taste.
export const similarity = (a, b) => {
    let shared = 0;
    let difference = 0;
    for (const [game, rating] of a) {
        const other = b.get(game);
        if (other === undefined) continue;
        shared++;
        difference += Math.abs(rating - other);
    }
    if (shared === 0) return 0;
    return (1 - difference / shared / 4) * (shared / (shared + 2));
};

// Games the neighbours rated that the member hasn't. A neighbour's vote counts in
// proportion to their similarity, and a low rating votes against the game.
export const collaborativeScores = (mine, neighbours) => {
    const scores = new Map();
    for (const { ratings, similarity: weight } of neighbours) {
        if (weight <= 0) continue;
        for (const [game, rating] of ratings) {
            if (mine.has(game)) continue;
            const entry = scores.get(game) ?? { score: 0, supporters: 0 };
            entry.score += weight * centered(rating);
            if (rating >= LIKED) entry.supporters++;
            scores.set(game, entry);
        }
    }
    for (const [game, { score, supporters }] of scores) {
        if (score <= 0 || supporters === 0) scores.delete(game);
    }
    return scores;
};

// How much the member likes each genre, from -1 to 1, scaled by their strongest feeling.
export const genreAffinity = (mine, genresByGame) => {
    const totals = new Map();
    for (const [game, rating] of mine) {
        for (const genre of genresByGame.get(game) ?? []) {
            totals.set(genre, (totals.get(genre) ?? 0) + centered(rating));
        }
    }
    const strongest = Math.max(0, ...[...totals.values()].map(Math.abs));
    if (strongest === 0) return new Map();
    return new Map([...totals].map(([genre, total]) => [genre, total / strongest]));
};

const bestGenre = (genres, affinity) =>
    genres.reduce((best, genre) => ((affinity.get(genre) ?? 0) > (affinity.get(best) ?? 0) ? genre : best), genres[0]);

// candidates: Map id -> { genre: string[] }
// similarTo:  Map id -> title of a game the member liked that IGDB lists it as similar to
export const rank = ({
    mine,
    tracked = new Set(),
    neighbours,
    candidates,
    genresByGame,
    similarTo = new Map(),
    limit = 12,
}) => {
    const collaborative = collaborativeScores(mine, neighbours);
    const affinity = genreAffinity(mine, genresByGame);
    const strongestVote = Math.max(0, ...[...collaborative.values()].map((c) => c.score));

    const ids = new Set([...collaborative.keys(), ...similarTo.keys(), ...candidates.keys()]);
    const ranked = [];

    for (const id of ids) {
        if (mine.has(id) || tracked.has(id)) continue; // already rated or tracked

        const genres = candidates.get(id)?.genre ?? [];
        const vote = collaborative.get(id);
        const voteScore = vote ? vote.score / strongestVote : 0;
        const genreScore = genres.length
            ? Math.max(0, genres.reduce((sum, g) => sum + (affinity.get(g) ?? 0), 0) / genres.length)
            : 0;
        const similarScore = similarTo.has(id) ? 1 : 0;

        const score = WEIGHTS.collaborative * voteScore + WEIGHTS.genre * genreScore + WEIGHTS.similar * similarScore;
        if (score <= 0) continue;

        const reasons = [];
        if (vote) reasons.push('Members with similar taste rated it highly');
        if (similarScore) reasons.push(`Similar to ${similarTo.get(id)}`);
        if (genreScore > 0) reasons.push(`Matches your taste for ${bestGenre(genres, affinity)}`);

        ranked.push({ id, score: Math.round(score * 100) / 100, reasons });
    }

    // Ties fall back to the id so the order is stable between requests.
    return ranked.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
};

// Bayesian average: a game with a few perfect ratings doesn't outrank one with many good ones.
export const popularityScore = ({ average, count }, priorMean = 3, priorWeight = 3) =>
    (average * count + priorMean * priorWeight) / (count + priorWeight);
