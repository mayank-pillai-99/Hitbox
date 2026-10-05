'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ListPlus, MessageSquare, Gamepad2 } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import SectionHeader from '@/components/ui/SectionHeader';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import GameCover from '@/components/ui/GameCover';
import { ProfileSkeleton, ListRowsSkeleton } from '@/components/ui/Skeleton';
import AddToListModal from '@/components/AddToListModal';
import GameStatusButtons from '@/components/GameStatusButtons';
import RatingHistogram from '@/components/RatingHistogram';
import GameMedia from '@/components/GameMedia';
import GameCard from '@/components/GameCard';
import AlsoLiked from '@/components/AlsoLiked';
import ReviewCard from '@/components/ReviewCard';
import LikeButton from '@/components/LikeButton';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const SORTS = [
    ['recent', 'Newest'],
    ['liked', 'Most liked'],
];

const Chip = ({ children }) => (
    <li className="border border-line-strong bg-panel-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">{children}</li>
);

export default function GameDetails({ id }) {
    const { user } = useAuth();
    const toast = useToast();
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [sort, setSort] = useState('recent');

    const gameReq = useApi(`/games/${id}`);
    // Stats, reviews and extras load alongside; the extras come from IGDB and may be slow or missing,
    // so a failure there just leaves those sections out.
    const stats = useApi(`/games/${id}/stats`);
    const reviews = useApi(`/reviews/game/${id}`, { sort });
    const extras = useApi(`/games/${id}/extras`);

    const game = gameReq.data;

    if (gameReq.loading) {
        return <PageShell><ProfileSkeleton /></PageShell>;
    }

    if (gameReq.error || !game) {
        const missing = gameReq.error?.response?.status === 404 || gameReq.error?.response?.status === 400;
        return (
            <PageShell>
                {missing ? (
                    <EmptyState icon={Gamepad2} title="Game not found" action={<Link href="/games" className="btn-primary">Browse games</Link>}>
                        We couldn&apos;t find that game.
                    </EmptyState>
                ) : (
                    <ErrorState message="Failed to load this game." onRetry={gameReq.reload} />
                )}
            </PageShell>
        );
    }

    const reviewList = reviews.data ?? [];
    const rating = game.averageRating ? game.averageRating.toFixed(1) : 'NR';

    const openListModal = () => {
        if (!user) {
            toast.warning('Please log in to add games to lists');
            return;
        }
        setIsListModalOpen(true);
    };

    return (
        <PageShell bare>
            <div className="relative overflow-hidden border-b border-line">
                {/* Flat tinted cover, no blur. */}
                {game.coverImage && (
                    <img src={game.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
                )}
                <div className="absolute inset-0 bg-ink/80" aria-hidden="true" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col md:flex-row gap-8 md:items-end">
                    <div className="brackets w-40 sm:w-52 aspect-[3/4] shrink-0 bg-panel border border-line">
                        <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                        <p className="label text-neon">
                            {game.platforms?.[0] || 'Game'}
                            {game.developer && <span className="text-muted"> / {game.developer}</span>}
                        </p>
                        <h1 className="display text-4xl sm:text-6xl mt-2 break-words animate-fade-in-up">{game.title}</h1>
                    </div>
                </div>
                <div className="stripes" aria-hidden="true" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-10 items-start">
                <aside className="w-full md:w-80 shrink-0 space-y-4 md:sticky md:top-24">
                    <div className="grid grid-cols-2 gap-3">
                        <StatTile label="Rating" value={rating} accent />
                        <StatTile label="Release" value={game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBA'} />
                    </div>
                    <GameStatusButtons gameId={id} onChange={stats.reload} />
                    <RatingHistogram stats={stats.data} />
                </aside>

                <div className="flex-1 min-w-0 w-full">
                    <section className="panel p-6 sm:p-8 mb-10" aria-labelledby="synopsis">
                        <h2 id="synopsis" className="label text-neon mb-4">Synopsis</h2>
                        <p className="text-lg text-muted leading-relaxed">
                            {game.description || 'No description available for this title.'}
                        </p>

                        <div className="mt-8 pt-8 border-t border-line grid sm:grid-cols-2 gap-8">
                            <div>
                                <h3 className="label mb-3">Genres</h3>
                                <ul className="flex flex-wrap gap-2">
                                    {game.genre?.length ? game.genre.map((g) => <Chip key={g}>{g}</Chip>) : <li className="text-muted">Not listed</li>}
                                </ul>
                            </div>
                            <div>
                                <h3 className="label mb-3">Platforms</h3>
                                <ul className="flex flex-wrap gap-2">
                                    {game.platforms?.length ? game.platforms.map((p) => <Chip key={p}>{p}</Chip>) : <li className="text-muted">Not listed</li>}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <GameMedia extras={extras.data} title={game.title} />

                    <div className="flex flex-wrap gap-3 mb-14">
                        {user ? (
                            <Link href={`/games/${game._id}/review`} className="btn-primary">
                                <Star className="w-4 h-4" aria-hidden="true" /> Rate &amp; review
                            </Link>
                        ) : (
                            <Link href="/login" className="btn-primary">Log in to review</Link>
                        )}
                        <button onClick={openListModal} className="btn-ghost">
                            <ListPlus className="w-4 h-4" aria-hidden="true" /> Add to list
                        </button>
                    </div>

                    <section aria-labelledby="reviews-heading">
                        <SectionHeader tag={`${reviewList.length} ${reviewList.length === 1 ? 'review' : 'reviews'}`} title="Community reviews" />
                        <span id="reviews-heading" className="sr-only">Community reviews</span>

                        {reviewList.length > 1 && (
                            <div className="flex gap-2 mb-4" role="group" aria-label="Sort reviews">
                                {SORTS.map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() => setSort(value)}
                                        aria-pressed={sort === value}
                                        className={`min-h-[44px] px-4 border text-sm font-bold uppercase tracking-wide ${sort === value ? 'bg-neon text-black border-neon' : 'border-line-strong text-muted hover:border-neon hover:text-neon'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {reviews.loading && reviewList.length === 0 ? (
                            <ListRowsSkeleton count={2} />
                        ) : reviews.error ? (
                            <ErrorState message="Could not load reviews." onRetry={reviews.reload} />
                        ) : reviewList.length === 0 ? (
                            <EmptyState icon={MessageSquare} title="No reviews yet">Be the first to review this game.</EmptyState>
                        ) : (
                            <ul className="space-y-3">
                                {reviewList.map((review) => (
                                    <li key={review._id}>
                                        <ReviewCard review={review} footer={<LikeButton review={review} />} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <AlsoLiked gameId={id} />

                    {extras.data?.similarGames?.length > 0 && (
                        <section className="mt-16">
                            <SectionHeader tag="From IGDB" title="More like this" as="h2" />
                            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {extras.data.similarGames.slice(0, 8).map((similar) => (
                                    <li key={similar.igdbId}><GameCard game={similar} /></li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>

            <AddToListModal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} gameId={id} />
        </PageShell>
    );
}
