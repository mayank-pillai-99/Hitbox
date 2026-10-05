import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import GameCover from '@/components/ui/GameCover';

// A list preview. The whole card is one link (the title is a stretched link), and the owner's
// name is a second link above it, so there are no links inside links.
export default function ListCard({ list, compact = false }) {
    const owner = list.user;

    return (
        <article className="panel panel-hover relative p-4 flex flex-col gap-3 h-full">
            <div className="flex items-start justify-between gap-3">
                <h3 className="display text-lg leading-tight">
                    <Link href={`/lists/${list._id}`} className="after:absolute after:inset-0 hover:text-neon focus-visible:outline-offset-4">
                        {list.name}
                    </Link>
                </h3>
                <span className="label shrink-0 text-neon">{list.gameCount} {list.gameCount === 1 ? 'game' : 'games'}</span>
            </div>

            {!compact && list.description && <p className="text-sm text-muted line-clamp-2">{list.description}</p>}

            {list.previewGames?.length > 0 && (
                <ul className="flex gap-1 mt-auto" aria-label="Games in this list">
                    {list.previewGames.slice(0, compact ? 4 : 5).map((game, i) => (
                        <li key={i} className="w-12 aspect-[3/4] border border-line overflow-hidden">
                            <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                        </li>
                    ))}
                </ul>
            )}

            {(owner || list.commentCount !== undefined) && (
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
                    {owner && (
                        <Link href={`/users/${owner.username}`} className="relative z-10 flex items-center gap-2 min-w-0 hover:text-neon">
                            <Avatar user={owner} size={24} />
                            <span className="text-sm font-bold truncate">{owner.username}</span>
                        </Link>
                    )}
                    {list.commentCount !== undefined && (
                        <span className="label flex items-center gap-1 shrink-0">
                            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                            {list.commentCount}
                            <span className="sr-only"> comments</span>
                        </span>
                    )}
                </div>
            )}
        </article>
    );
}
