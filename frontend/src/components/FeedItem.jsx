import Link from 'next/link';
import { Star, List as ListIcon, Check, Play, BookmarkPlus, EyeOff } from 'lucide-react';
import GameCover from '@/components/ui/GameCover';

const STATUS_TEXT = {
    played: { label: 'played', icon: Check },
    playing: { label: 'started playing', icon: Play },
    want_to_play: { label: 'wants to play', icon: BookmarkPlus },
};

const timeAgo = (iso) => {
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    for (const [unit, size] of [['d', 86400], ['h', 3600], ['m', 60]]) {
        if (seconds >= size) return `${Math.floor(seconds / size)}${unit} ago`;
    }
    return 'just now';
};

const linkClass = 'font-bold text-fg hover:text-neon';

// One line of the activity feed: a review, a new list, or a status change.
export default function FeedItem({ item }) {
    const { user, game } = item;
    const name = user?.username || 'Someone';
    const gameHref = `/games/${game?._id}`;
    const gameLink = <Link href={gameHref} className={linkClass}>{game?.title || 'a game'}</Link>;
    const userLink = <Link href={`/users/${name}`} className={linkClass}>{name}</Link>;

    let body = null;
    let Icon = Star;
    if (item.type === 'review') {
        body = (
            <>
                <p className="text-sm text-muted">
                    {userLink} reviewed {gameLink}
                    <span className="ml-2 inline-flex items-center gap-1 text-neon font-bold font-mono">
                        <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        <span className="sr-only">Rated </span>{item.rating}
                    </span>
                </p>
                {item.spoiler ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-warn">
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> Contains spoilers. Open the game page to read it.
                    </p>
                ) : (
                    item.text && <p className="mt-1 text-sm text-muted line-clamp-2">{item.text}</p>
                )}
            </>
        );
    } else if (item.type === 'list') {
        Icon = ListIcon;
        body = (
            <p className="text-sm text-muted">
                {userLink} made a list{' '}
                <Link href={`/lists/${item.list._id}`} className={linkClass}>{item.list.name}</Link>
                <span className="ml-2 label">{item.list.gameCount} {item.list.gameCount === 1 ? 'game' : 'games'}</span>
            </p>
        );
    } else if (item.type === 'status') {
        const status = STATUS_TEXT[item.status];
        Icon = status?.icon || Check;
        body = <p className="text-sm text-muted">{userLink} {status?.label || 'updated'} {gameLink}</p>;
    }

    return (
        <li className="panel p-3 flex gap-4">
            {game ? (
                <Link href={gameHref} tabIndex={-1} aria-hidden="true" className="shrink-0 w-12 aspect-[3/4] border border-line overflow-hidden">
                    <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                </Link>
            ) : (
                <div className="shrink-0 w-12 aspect-[3/4] border border-line flex items-center justify-center text-dim" aria-hidden="true">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                {body}
                <time dateTime={item.createdAt} className="label mt-1 block">{timeAgo(item.createdAt)}</time>
            </div>
        </li>
    );
}
