# 3. "Popular this week" blends IGDB and Hitbox activity

## Context
The home page said "Popular this week" but showed the most-rated games of a hardcoded year. Using only Hitbox's own activity would be empty or noisy for a small community; using only IGDB would say nothing about this community.

## Decision
`GET /api/games/trending` scores each game from two signals, each worth up to one point:
- its rank in IGDB's most-visited list (the "Visits" popularity type, refreshed by IGDB daily), and
- Hitbox activity in the last 7 days: reviews count double, status changes count once, capped so one busy game cannot dominate.

Only released games with a cover are shown. The result is cached for 15 minutes. If IGDB's popularity data is unavailable it falls back to the past year's most-rated releases, with the year computed fresh.

## Consequences
- The list is live from day one and still reflects the community as it grows.
- IGDB does not document the time window of its visit counts, so the IGDB half is "what people are looking at now", not an exact seven days. The Hitbox half is exactly seven days.
- Some entries are obscure games with high visit counts; that is the real data and is left unfiltered.
