'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Dices, Clock, BookmarkPlus } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import SectionHeader from '@/components/ui/SectionHeader';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import ToggleGroup from '@/components/ui/ToggleGroup';
import GameCover from '@/components/ui/GameCover';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import GameCard from '@/components/GameCard';
import { formatHours } from '@/utils/format';
import useApi from '@/hooks/useApi';
import useRequireAuth from '@/hooks/useRequireAuth';

const TIMES = [
    ['any', 'Any length'],
    ['short', 'Short (up to 10h)'],
    ['medium', 'Medium (10-30h)'],
    ['long', 'Long (30h+)'],
];
const TOP_PICKS = 5;

// The "play this next" panel. Starts on the best fit; Surprise me picks at random among the top few.
function PlayNext({ items }) {
    const [index, setIndex] = useState(0);
    const item = items[Math.min(index, items.length - 1)];

    return (
        <section className="panel panel-accent p-5 sm:p-6 flex flex-col sm:flex-row gap-6" aria-labelledby="play-next">
            <Link href={`/games/${item.game._id}`} className="shrink-0 w-32 sm:w-40 aspect-[3/4] panel panel-hover block self-start" aria-hidden="true" tabIndex={-1}>
                <GameCover src={item.game.coverImage} title={item.game.title} className="w-full h-full" />
            </Link>
            <div className="min-w-0 flex-1 flex flex-col">
                <p id="play-next" className="label text-neon">{index === 0 ? 'Play this next' : 'How about this one?'}</p>
                <h2 className="display text-3xl sm:text-4xl mt-2 break-words">{item.game.title}</h2>
                <p className="mt-3 text-muted">{item.reason}</p>
                <p className="mt-2 label flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {formatHours(item.hours)}
                </p>
                <div className="mt-auto pt-5 flex flex-wrap gap-3">
                    <Link href={`/games/${item.game._id}`} className="btn-primary">View game</Link>
                    {items.length > 1 && (
                        <button
                            onClick={() => setIndex(Math.floor(Math.random() * Math.min(TOP_PICKS, items.length)))}
                            className="btn-ghost"
                        >
                            <Dices className="w-4 h-4" aria-hidden="true" /> Surprise me
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

function BacklogView() {
    const { ready } = useRequireAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const time = TIMES.some(([value]) => value === searchParams.get('time')) ? searchParams.get('time') : 'any';

    const { data, loading, error, reload } = useApi('/backlog', { time }, { enabled: ready });

    if (!ready || loading) return <PageShell><ProfileSkeleton /></PageShell>;
    if (error) return <PageShell><ErrorState message="Failed to load your backlog." onRetry={reload} /></PageShell>;

    const { summary, items } = data;
    const days = summary.hours / 24;

    const setTime = (value) => router.push(value === 'any' ? pathname : `${pathname}?time=${value}`);

    return (
        <PageShell>
            <header className="mb-8 animate-fade-in-up">
                <p className="label text-neon">Backlog planner</p>
                <h1 className="display text-4xl sm:text-6xl mt-2">What should I <span className="text-outline-lime">play next?</span></h1>
                <p className="mt-4 text-lg text-muted max-w-2xl">
                    Your want-to-play list, ranked by how well each game fits your taste and how long it takes to beat.
                </p>
            </header>

            {summary.games === 0 ? (
                <EmptyState
                    icon={BookmarkPlus}
                    title="Your backlog is empty"
                    action={<Link href="/games" className="btn-primary">Browse games</Link>}
                >
                    Mark games as &ldquo;Want to play&rdquo; and they will show up here.
                </EmptyState>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                        <StatTile label="Games waiting" value={summary.games} accent />
                        <StatTile label={days >= 1 ? `Hours to clear (~${days.toFixed(1)} days nonstop)` : 'Hours to clear'} value={Math.round(summary.hours)} />
                        <StatTile label="Length unknown" value={summary.unknown} />
                    </div>

                    <ToggleGroup label="Filter by length" options={TIMES} value={time} onChange={setTime} className="mb-6 flex-wrap" />

                    {items.length === 0 ? (
                        <EmptyState icon={Clock} title="Nothing in that range" action={<button onClick={() => setTime('any')} className="btn-primary">Show any length</button>}>
                            None of your backlog games fit this length.
                        </EmptyState>
                    ) : (
                        <div className="space-y-12">
                            <PlayNext key={`${time}-${items[0].game._id}`} items={items} />

                            <section>
                                <SectionHeader tag={`${items.length} ${items.length === 1 ? 'game' : 'games'}`} title="Ranked for you" />
                                <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {items.map((item, i) => (
                                        <li key={item.game._id}>
                                            <GameCard game={item.game} />
                                            <p className="label mt-1 flex items-center gap-2">
                                                <span className="text-neon">#{i + 1}</span>
                                                <span>{formatHours(item.hours)}</span>
                                            </p>
                                            <p className="text-xs text-scan mt-1 leading-snug line-clamp-2" title={item.reason}>{item.reason}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        </div>
                    )}
                </>
            )}
        </PageShell>
    );
}

export default function BacklogPage() {
    return (
        <Suspense fallback={<PageShell><ProfileSkeleton /></PageShell>}>
            <BacklogView />
        </Suspense>
    );
}
