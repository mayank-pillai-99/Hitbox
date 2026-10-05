'use client';

import Link from 'next/link';
import { Gamepad2, MessageSquare, Trophy } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import SectionHeader from '@/components/ui/SectionHeader';
import StatTile from '@/components/ui/StatTile';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { GameGridSkeleton, ListRowsSkeleton, Skeleton } from '@/components/ui/Skeleton';
import GameCard from '@/components/GameCard';
import ReviewCard from '@/components/ReviewCard';
import ListCard from '@/components/ListCard';
import FollowFeed from '@/components/FollowFeed';
import RecommendedForYou from '@/components/RecommendedForYou';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    // Each section loads on its own, so one failing request doesn't blank the page.
    const trending = useApi('/games/trending', { limit: 6 });
    const lists = useApi('/lists/discover', { sort: 'popular', limit: 3 });
    const members = useApi('/users', { limit: 3, sort: 'reviews' });
    const reviews = useApi('/reviews/recent', { limit: 5 });
    const stats = useApi('/stats');

    const games = trending.data?.results ?? [];
    const heroGame = games[0];

    return (
        <PageShell bare>
            <section className="relative overflow-hidden border-b border-line">
                {/* Flat tinted photo: no blur, no gradient glow. */}
                <img src="/clair.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-ink/70" aria-hidden="true" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
                    <p className="label text-neon animate-fade-in-up">The social network for gamers</p>

                    <h1 className="display text-5xl sm:text-7xl md:text-8xl mt-4 animate-fade-in-up stagger-1">
                        Track your
                        <br />
                        <span className="text-outline-lime">virtual life</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg text-muted animate-fade-in-up stagger-2">
                        Log every boss defeated, rate every story, and build the archive of your gaming history.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up stagger-3">
                        {user ? (
                            <Link href="/profile" className="btn-primary">My profile</Link>
                        ) : (
                            <Link href="/signup" className="btn-primary">Start logging</Link>
                        )}
                        <Link href="/games" className="btn-ghost">Browse games</Link>
                    </div>

                    {heroGame && (
                        <p className="label mt-10 animate-fade-in stagger-4">
                            Trending now /{' '}
                            <Link href={`/games/${heroGame._id}`} className="text-fg hover:text-neon">{heroGame.title}</Link>
                        </p>
                    )}
                </div>

                <div className="stripes" aria-hidden="true" />
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Site statistics">
                {stats.loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="status" aria-busy="true">
                        <span className="sr-only">Loading statistics</span>
                        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 border border-line" />)}
                    </div>
                ) : stats.data ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatTile label="Games logged" value={stats.data.games.toLocaleString()} accent />
                        <StatTile label="Reviews" value={stats.data.reviews.toLocaleString()} />
                        <StatTile label="Lists created" value={stats.data.lists.toLocaleString()} />
                        <StatTile label="Members" value={stats.data.members.toLocaleString()} />
                    </div>
                ) : null}
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-line">
                <SectionHeader index="01" tag="Trending" title="Popular this week" href="/games" linkLabel="All games" />
                {trending.loading ? (
                    <GameGridSkeleton count={6} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" />
                ) : trending.error ? (
                    <ErrorState message="Could not load trending games." onRetry={trending.reload} />
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {games.map((game) => (
                            <li key={game._id || game.igdbId}><GameCard game={game} /></li>
                        ))}
                    </ul>
                )}
            </section>

            {user && <RecommendedForYou />}

            <section className="border-t border-line bg-panel/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 min-w-0">
                        {user && <FollowFeed />}

                        <SectionHeader index={user ? '03' : '02'} tag="Community" title="Just reviewed" />
                        {reviews.loading ? (
                            <ListRowsSkeleton count={3} />
                        ) : reviews.error ? (
                            <ErrorState message="Could not load recent reviews." onRetry={reviews.reload} />
                        ) : reviews.data?.length > 0 ? (
                            <ul className="space-y-3">
                                {reviews.data.map((review) => (
                                    <li key={review._id}>
                                        <ReviewCard review={review} showGame showUser />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState icon={MessageSquare} title="No reviews yet">Be the first to review a game.</EmptyState>
                        )}
                    </div>

                    <aside className="lg:col-span-4 min-w-0 space-y-12">
                        <section aria-labelledby="popular-lists">
                            <SectionHeader tag="Lists" title="Popular lists" as="h2" href="/lists" linkLabel="All" />
                            <span id="popular-lists" className="sr-only">Popular lists</span>
                            {lists.loading ? (
                                <ListRowsSkeleton count={3} />
                            ) : lists.error ? (
                                <ErrorState message="Could not load lists." onRetry={lists.reload} />
                            ) : lists.data?.lists?.length > 0 ? (
                                <ul className="space-y-3">
                                    {lists.data.lists.map((list) => (
                                        <li key={list._id}><ListCard list={list} compact /></li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState icon={Trophy} title="No lists yet" />
                            )}
                        </section>

                        <section>
                            <SectionHeader tag="Members" title="Top reviewers" href="/members" linkLabel="All" />
                            {members.loading ? (
                                <ListRowsSkeleton count={3} />
                            ) : members.error ? (
                                <ErrorState message="Could not load members." onRetry={members.reload} />
                            ) : (
                                <ol className="space-y-2">
                                    {(members.data?.members ?? []).map((member, i) => (
                                        <li key={member._id}>
                                            <Link
                                                href={`/users/${member.username}`}
                                                className="panel panel-hover flex items-center gap-4 p-3"
                                            >
                                                <span className="numeral text-3xl w-8 text-center" aria-hidden="true">{i + 1}</span>
                                                <Avatar user={member} size={40} />
                                                <span className="min-w-0">
                                                    <span className="block font-bold truncate">{member.username}</span>
                                                    <span className="label">{member.stats?.reviews || 0} reviews</span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </aside>
                </div>
            </section>

            {!user && (
                <section className="border-t border-line">
                    <div className="stripes" aria-hidden="true" />
                    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                        <Gamepad2 className="w-10 h-10 mx-auto text-neon mb-4" aria-hidden="true" />
                        <h2 className="display text-4xl sm:text-5xl">Ready to join the crew?</h2>
                        <p className="mt-4 text-lg text-muted">Start building your archive today. It&apos;s free.</p>
                        <Link href="/signup" className="btn-primary mt-8">Create account</Link>
                    </div>
                </section>
            )}
        </PageShell>
    );
}
