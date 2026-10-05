import Link from 'next/link';
import { Star, List as ListIcon, Check, Play, BookmarkPlus, EyeOff } from 'lucide-react';

const STATUS_TEXT = {
    played: { label: 'played', icon: Check },
    playing: { label: 'started playing', icon: Play },
    want_to_play: { label: 'wants to play', icon: BookmarkPlus },
};

const timeAgo = (iso) => {
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    const units = [['d', 86400], ['h', 3600], ['m', 60]];
    for (const [unit, size] of units) {
        if (seconds >= size) return `${Math.floor(seconds / size)}${unit} ago`;
    }
    return 'just now';
};

const gameHref = (game) => `/games/${game?._id}`;

// One line of the activity feed: a review, a new list, or a status change.
export default function FeedItem({ item }) {
    const { user, game } = item;
    const name = user?.username || 'Someone';

    let body = null;
    if (item.type === 'review') {
        body = (
            <>
                <p className="text-sm text-zinc-300">
                    <Link href={`/users/${name}`} className="font-bold text-white hover:text-lime-400">{name}</Link>
                    {' reviewed '}
                    <Link href={gameHref(game)} className="font-bold text-white hover:text-lime-400">{game?.title || 'a game'}</Link>
                    <span className="ml-2 inline-flex items-center gap-1 text-lime-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />{item.rating}
                    </span>
                </p>
                {item.spoiler ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-400">
                        <EyeOff className="w-3.5 h-3.5" /> Contains spoilers. Open the game page to read it.
                    </p>
                ) : (
                    item.text && <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{item.text}</p>
                )}
            </>
        );
    } else if (item.type === 'list') {
        body = (
            <p className="text-sm text-zinc-300">
                <Link href={`/users/${name}`} className="font-bold text-white hover:text-lime-400">{name}</Link>
                {' made a list '}
                <Link href={`/lists/${item.list._id}`} className="font-bold text-white hover:text-lime-400">{item.list.name}</Link>
                <span className="ml-2 text-zinc-500">
                    {item.list.gameCount} {item.list.gameCount === 1 ? 'game' : 'games'}
                </span>
            </p>
        );
    } else if (item.type === 'status') {
        const status = STATUS_TEXT[item.status];
        body = (
            <p className="text-sm text-zinc-300">
                <Link href={`/users/${name}`} className="font-bold text-white hover:text-lime-400">{name}</Link>
                {` ${status?.label || 'updated'} `}
                <Link href={gameHref(game)} className="font-bold text-white hover:text-lime-400">{game?.title || 'a game'}</Link>
            </p>
        );
    }

    const Icon = item.type === 'list' ? ListIcon : item.type === 'status' ? STATUS_TEXT[item.status]?.icon || Check : Star;

    return (
        <div className="flex gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
            {game?.coverImage ? (
                <img src={game.coverImage} alt="" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
                <div className="w-12 h-16 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-500">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                {body}
                <span className="mt-1 block text-xs text-zinc-600">{timeAgo(item.createdAt)}</span>
            </div>
        </div>
    );
}
