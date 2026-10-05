# 5. The backlog planner and taste match

## Context
Hitbox matches what other game-logging sites do. Most players' real problem is a backlog they never finish, and the question "do we like the same games?" is the natural social hook between two members.

## Decision
- **Backlog planner** (`services/backlog.js`): rank the want-to-play list by a fit score (60% how well the game's genres match the genres the member rates highly, 40% community rating) and show typical hours to beat from IGDB's `game_time_to_beats`. Games are bucketed short (up to 10h), medium (10-30h) or long (30h+); ties go to the quicker game. Every item has a plain-language reason.
- **Time to beat** is fetched in one batch per backlog and stored on the game for 30 days, including "IGDB has no answer", so a game with no data is not asked about again. If IGDB is down the page still works with lengths shown as unknown, and nothing is stored.
- **Taste match** (`services/tasteMatch.js`): the agreement of shared ratings as a percentage (100 means identical), with the games both members loved and the biggest disagreements. Confidence is labelled low, medium or high by how many games are shared, and the UI dims a low-confidence percentage.

## Consequences
- Both features are pure functions plus thin loaders, so they are cheap to test and to change.
- IGDB's time-to-beat coverage is smaller than its game catalog, so some games show "length unknown" and appear only under the "any length" filter.
- The percentage is a simple agreement measure, not a statistical estimate; the confidence label is there so it is not over-read.
