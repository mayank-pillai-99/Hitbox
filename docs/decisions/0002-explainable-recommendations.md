# 2. Recommendations are explainable heuristics, not machine learning

## Context
"Recommended for you" could be a trained model. Hitbox is a small catalog with a small community, so there is little training data, and a model's picks cannot be explained to the person receiving them.

## Decision
Score each candidate game from three signals that can each be described in a sentence (`services/recommend.js`):
1. **Similar members**: members whose ratings are close to yours (similarity shrunk when they share few games) vote for games you haven't rated; a low rating votes against.
2. **Genre taste**: the genres of games you rate highly count for the candidate.
3. **IGDB similar games**: games IGDB lists as similar to ones you rated 4 or more.

Every recommendation carries the reasons that applied ("Members with similar taste rated it highly", "Similar to Hades", "Matches your taste for RPG"). Members who have rated nothing get a Bayesian-averaged popularity list instead.

## Consequences
- Picks are explainable and unit-testable: the scoring is pure functions over plain data.
- It works from the first few ratings and needs no training or model hosting.
- It will not find subtle patterns a model might. With a large community the similarity step would be the natural place to swap in something stronger without changing the response shape.
- The recommendation path only reads data that is already cached; it never calls IGDB.
