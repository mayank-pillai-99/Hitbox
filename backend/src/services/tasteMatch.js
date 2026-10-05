// How alike two members rate. Pure: takes two Maps of game id -> rating (1 to 5).

export const LOVED = 4; // a rating from here up counts as loved
export const DISAGREEMENT_GAP = 2; // ratings this far apart count as a disagreement

export const confidenceFor = (shared) => {
    if (shared === 0) return 'none';
    if (shared < 3) return 'low';
    if (shared < 6) return 'medium';
    return 'high';
};

// percent is how closely the shared ratings agree: 100 = identical, 0 = as far apart as possible.
// With only a game or two in common it is a hint, so `confidence` says how much to trust it.
export const compareTaste = (mine, theirs) => {
    const shared = [];
    for (const [game, rating] of mine) {
        const other = theirs.get(game);
        if (other !== undefined) shared.push({ game, mine: rating, theirs: other });
    }
    if (shared.length === 0) return { shared: 0, percent: null, confidence: 'none', bothLoved: [], disagree: [] };

    const meanGap = shared.reduce((sum, s) => sum + Math.abs(s.mine - s.theirs), 0) / shared.length;
    // Highest combined rating first, then game id, so the order doesn't change between requests.
    const byId = (a, b) => a.game.localeCompare(b.game);

    return {
        shared: shared.length,
        percent: Math.round((1 - meanGap / 4) * 100),
        confidence: confidenceFor(shared.length),
        bothLoved: shared
            .filter((s) => s.mine >= LOVED && s.theirs >= LOVED)
            .sort((a, b) => b.mine + b.theirs - (a.mine + a.theirs) || byId(a, b)),
        disagree: shared
            .filter((s) => Math.abs(s.mine - s.theirs) >= DISAGREEMENT_GAP)
            .sort((a, b) => Math.abs(b.mine - b.theirs) - Math.abs(a.mine - a.theirs) || byId(a, b)),
    };
};
