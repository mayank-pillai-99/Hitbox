'use client';

import Link from 'next/link';
import { Heart, Swords } from 'lucide-react';
import GameCover from '@/components/ui/GameCover';
import { Skeleton } from '@/components/ui/Skeleton';
import useApi from '@/hooks/useApi';

const CONFIDENCE = {
    low: (n) => `Only ${n} shared ${n === 1 ? 'game' : 'games'}, so treat this as a hint.`,
    medium: (n) => `Based on ${n} shared games.`,
    high: (n) => `Based on ${n} shared games.`,
};

function GameRow({ rows, tone }) {
    return (
        <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {rows.map(({ game, mine, theirs }) => (
                <li key={game._id}>
                    <Link href={`/games/${game._id}`} className="block aspect-[3/4] panel panel-hover overflow-hidden" title={game.title}>
                        <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                    </Link>
                    <p className={`label mt-1 ${tone}`}>
                        You {mine} / Them {theirs}
                    </p>
                </li>
            ))}
        </ul>
    );
}

// How alike your ratings are to this member's, for a signed-in visitor. Quiet if it can't load.
export default function TasteMatch({ username }) {
    const { data, loading, error } = useApi(`/users/${encodeURIComponent(username)}/match`);

    if (error) return null;
    if (loading) return <Skeleton className="h-32 border border-line mb-8" />;

    return (
        <section className="panel p-5 sm:p-6 mb-8" aria-labelledby="taste-match">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="shrink-0">
                    <p id="taste-match" className="label text-neon">
                        Taste match{data.confidence === 'low' && <span className="text-warn"> / low confidence</span>}
                    </p>
                    {data.percent === null ? (
                        <p className="display text-2xl mt-2">No games in common yet</p>
                    ) : (
                        <p
                            className={`numeral text-6xl sm:text-7xl mt-1 ${data.confidence === 'low' ? 'opacity-50' : ''}`}
                            aria-label={`${data.percent} percent match`}
                        >
                            {data.percent}%
                        </p>
                    )}
                </div>
                <p className="text-muted sm:max-w-sm">
                    {data.percent === null
                        ? `Rate games ${username} has rated too, and your match will show up here.`
                        : CONFIDENCE[data.confidence](data.shared)}
                </p>
            </div>

            {data.bothLoved.length > 0 && (
                <div className="mt-6 pt-6 border-t border-line">
                    <h3 className="label text-neon flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4" aria-hidden="true" /> You both loved
                    </h3>
                    <GameRow rows={data.bothLoved} tone="!text-neon" />
                </div>
            )}

            {data.disagree.length > 0 && (
                <div className="mt-6 pt-6 border-t border-line">
                    <h3 className="label text-warn flex items-center gap-2 mb-3">
                        <Swords className="w-4 h-4" aria-hidden="true" /> You disagree on
                    </h3>
                    <GameRow rows={data.disagree} tone="!text-warn" />
                </div>
            )}
        </section>
    );
}
