import Follow from '../models/Follow.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import GameStatus from '../models/GameStatus.js';
import User from '../models/User.js';
import Game from '../models/Game.js';

// Fan-out on read: the feed is assembled from the source collections when asked for,
// so there is no separate activity log to keep in sync, and unfollowing or deleting
// a review takes effect immediately.
export const MAX_FOLLOWED = 500;

// Newest first; ties fall back to the id so the order is stable.
const byNewest = (a, b) => b.createdAt - a.createdAt || String(b._id).localeCompare(String(a._id));

// Merges candidates from several sources into one page. `nextBefore` is the cursor for the
// next page, or null when this is the last one. Each source must supply at least
// `limit + 1` candidates for this to be exact.
export const mergeActivity = (items, limit) => {
    const sorted = [...items].sort(byNewest);
    const page = sorted.slice(0, limit);
    return { items: page, nextBefore: sorted.length > limit ? page.at(-1).createdAt : null };
};

const idsOf = (items, field) => [...new Set(items.map((i) => String(i[field] ?? '')).filter(Boolean))];

export const getFeed = async (userId, { before, limit }) => {
    const follows = await Follow.find({ follower: userId }).select('following').limit(MAX_FOLLOWED).lean();
    const followedIds = follows.map((f) => f.following);
    if (followedIds.length === 0) return { items: [], nextBefore: null, following: 0 };

    const when = before ? { $lt: before } : { $lte: new Date() };
    const take = limit + 1;

    const [reviews, lists, statuses] = await Promise.all([
        Review.find({ user: { $in: followedIds }, createdAt: when })
            .sort({ createdAt: -1 })
            .limit(take)
            .lean(),
        List.find({ user: { $in: followedIds }, createdAt: when })
            .sort({ createdAt: -1 })
            .limit(take)
            .lean(),
        GameStatus.find({ user: { $in: followedIds }, updatedAt: when })
            .sort({ updatedAt: -1 })
            .limit(take)
            .lean(),
    ]);

    const candidates = [
        ...reviews.map((r) => ({
            _id: r._id,
            type: 'review',
            user: r.user,
            game: r.game,
            createdAt: r.createdAt,
            rating: r.rating,
            spoiler: r.spoiler,
            text: r.text,
        })),
        ...lists.map((l) => ({
            _id: l._id,
            type: 'list',
            user: l.user,
            createdAt: l.createdAt,
            list: { _id: l._id, name: l.name, gameCount: l.games.length },
        })),
        ...statuses.map((s) => ({
            _id: s._id,
            type: 'status',
            user: s.user,
            game: s.game,
            createdAt: s.updatedAt,
            status: s.status,
        })),
    ];

    const { items, nextBefore } = mergeActivity(candidates, limit);

    // Fill in names and covers for just this page, one query per collection.
    const [users, games] = await Promise.all([
        User.find({ _id: { $in: idsOf(items, 'user') } })
            .select('username profilePicture')
            .lean(),
        Game.find({ _id: { $in: idsOf(items, 'game') } })
            .select('title coverImage slug igdbId')
            .lean(),
    ]);
    const userById = new Map(users.map((u) => [String(u._id), u]));
    const gameById = new Map(games.map((g) => [String(g._id), g]));

    return {
        items: items.map((item) => {
            const { text, ...rest } = item;
            return {
                ...rest,
                // Spoiler text is never sent in the feed; the game page hides it behind a click.
                ...(text && !item.spoiler && { text }),
                user: userById.get(String(item.user)) ?? null,
                ...(item.game && { game: gameById.get(String(item.game)) ?? null }),
            };
        }),
        nextBefore,
        following: followedIds.length,
    };
};
