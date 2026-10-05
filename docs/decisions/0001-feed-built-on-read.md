# 1. The activity feed is built when you load it

## Context
Members follow each other and see what the people they follow have been doing: new reviews, new lists and status changes. The usual designs are either to write every event into each follower's feed when it happens ("fan-out on write") or to assemble the feed from the source data when it is requested ("fan-out on read").

## Decision
Build it on read. `GET /api/feed` loads the members you follow (capped at 500), runs three indexed queries (reviews, lists, game statuses) newer than a cursor, merges them with a pure function (`mergeActivity`), and fills in names and covers for just that page with batched `$in` queries. Paging uses a `before` timestamp cursor.

## Consequences
- There is no activity collection to keep in sync. Unfollowing, deleting a review or renaming a list is reflected on the next load, with no cleanup jobs.
- Cost grows with how many people you follow, not with how many followers someone has, so a popular member costs nothing extra. The cap of 500 and the `(user, createdAt)` indexes keep it bounded.
- It cannot express events that leave no trace in the source data (for example, a status that was set and then cleared). That is acceptable here.
- If the app outgrew this, the merge function and endpoint shape would stay; only the loader would change to read from a precomputed feed.
