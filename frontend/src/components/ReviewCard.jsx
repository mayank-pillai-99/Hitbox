'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import GameCover from '@/components/ui/GameCover';
import RatingPips from '@/components/ui/RatingPips';

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// One review. `showGame` adds the cover and game title (for lists of someone's reviews or the home page),
// `showUser` adds the reviewer (for a game's reviews). Spoiler text stays hidden until clicked.
// `footer` is for actions such as the like button.
export default function ReviewCard({ review, showGame = false, showUser = false, footer }) {
    const [revealed, setRevealed] = useState(false);
    const { game, user } = review;
    const gameHref = `/games/${game?._id || game?.igdbId}`;
    const hidden = review.spoiler && !revealed;

    return (
        <article className="panel p-4 sm:p-5 flex gap-4">
            {showGame && (
                <Link href={gameHref} className="shrink-0 w-20 sm:w-24 aspect-[3/4] panel panel-hover block" tabIndex={-1} aria-hidden="true">
                    <GameCover src={game?.coverImage} title={game?.title} className="w-full h-full" />
                </Link>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    {showGame ? (
                        <h3 className="display text-lg sm:text-xl truncate">
                            <Link href={gameHref} className="hover:text-neon">{game?.title || 'Unknown game'}</Link>
                        </h3>
                    ) : (
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar user={user} size={32} />
                            {user ? (
                                <Link href={`/users/${user.username}`} className="font-bold truncate hover:text-neon">{user.username}</Link>
                            ) : (
                                <span className="font-bold text-muted">Unknown member</span>
                            )}
                        </div>
                    )}
                    <RatingPips rating={review.rating} />
                </div>

                <div className="label mt-2 flex flex-wrap items-center gap-x-2">
                    {showGame && showUser && user && (
                        <>
                            <Avatar user={user} size={20} />
                            <Link href={`/users/${user.username}`} className="text-fg hover:text-neon normal-case tracking-normal font-sans text-sm font-bold">{user.username}</Link>
                            <span aria-hidden="true">/</span>
                        </>
                    )}
                    <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
                </div>

                {review.text && (
                    hidden ? (
                        <button
                            onClick={() => setRevealed(true)}
                            className="mt-3 flex items-center gap-2 min-h-[44px] text-sm font-bold text-warn hover:text-fg"
                        >
                            <EyeOff className="w-4 h-4" aria-hidden="true" />
                            Contains spoilers. Click to show.
                        </button>
                    ) : (
                        <p className="mt-3 text-muted leading-relaxed line-clamp-6 whitespace-pre-line">{review.text}</p>
                    )
                )}

                {footer && <div className="mt-3 pt-3 border-t border-line flex items-center justify-end">{footer}</div>}
            </div>
        </article>
    );
}
