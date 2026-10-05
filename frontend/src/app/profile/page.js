'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Plus, Pencil, Trash2, Check, Play, BookmarkPlus, ListX, MessageSquare, Gamepad2 } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import SectionHeader from '@/components/ui/SectionHeader';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import GameCover from '@/components/ui/GameCover';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import ProfileHeader from '@/components/ProfileHeader';
import ListCard from '@/components/ListCard';
import ReviewCard from '@/components/ReviewCard';
import ConfirmModal from '@/components/ConfirmModal';
import EditReviewModal from '@/components/EditReviewModal';
import useApi from '@/hooks/useApi';
import useRequireAuth from '@/hooks/useRequireAuth';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';

const SHELVES = [
    { key: 'playing', label: 'Playing', icon: Play, color: 'var(--color-scan)' },
    { key: 'want_to_play', label: 'Want to play', icon: BookmarkPlus, color: 'var(--color-warn)' },
    { key: 'played', label: 'Played', icon: Check, color: 'var(--color-neon)' },
];

function Shelf({ shelf, items }) {
    const Icon = shelf.icon;
    return (
        <section className="panel p-4" aria-label={shelf.label} style={{ borderTop: `3px solid ${shelf.color}` }}>
            <h3 className="flex items-center justify-between label mb-3" style={{ color: shelf.color }}>
                <span className="flex items-center gap-2"><Icon className="w-4 h-4" aria-hidden="true" />{shelf.label}</span>
                <span>{items.length}</span>
            </h3>
            {items.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2">
                    {items.slice(0, 6).map(({ game }) => (
                        <li key={game._id}>
                            <Link href={`/games/${game._id}`} className="block aspect-[3/4] border border-line hover:border-neon overflow-hidden" title={game.title}>
                                <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted">Nothing here yet.</p>
            )}
        </section>
    );
}

export default function Profile() {
    const { user, ready } = useRequireAuth();
    const toast = useToast();

    const lists = useApi('/lists', undefined, { enabled: ready });
    const counts = useApi('/game-status/counts', undefined, { enabled: ready });
    const statuses = useApi('/game-status', undefined, { enabled: ready });
    const reviews = useApi('/reviews/my', undefined, { enabled: ready });

    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    if (!ready || lists.loading || counts.loading || statuses.loading || reviews.loading) {
        return <PageShell><ProfileSkeleton /></PageShell>;
    }

    const failed = lists.error || counts.error || statuses.error || reviews.error;
    if (failed) {
        const retry = () => { lists.reload(); counts.reload(); statuses.reload(); reviews.reload(); };
        return <PageShell><ErrorState message="Failed to load your profile." onRetry={retry} /></PageShell>;
    }

    const c = counts.data;
    const myLists = lists.data.map((list) => ({ ...list, gameCount: list.games.length, previewGames: list.games.slice(0, 5) }));

    const deleteReview = async (id) => {
        try {
            await api.delete(`/reviews/${id}`);
            toast.success('Review deleted');
            reviews.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete review');
        }
    };

    return (
        <PageShell bare>
            <ProfileHeader
                profile={user}
                actions={
                    <Link href="/settings" className="btn-ghost">
                        <Settings className="w-4 h-4" aria-hidden="true" /> Edit profile
                    </Link>
                }
            >
                <StatTile label="Played" value={c.played} accent />
                <StatTile label="Playing" value={c.playing} />
                <StatTile label="Want to play" value={c.want_to_play} />
                <StatTile label="Reviews" value={user.stats?.reviews ?? reviews.data.length} />
                <StatTile label="Lists" value={user.stats?.lists ?? myLists.length} />
            </ProfileHeader>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-12 gap-10">
                <aside className="lg:col-span-4 min-w-0 space-y-4" aria-label="Your game shelves">
                    {SHELVES.map((shelf) => <Shelf key={shelf.key} shelf={shelf} items={statuses.data[shelf.key]} />)}
                </aside>

                <div className="lg:col-span-8 min-w-0 space-y-14">
                    <section>
                        <SectionHeader tag="Collections" title="My lists" />
                        <div className="-mt-3 mb-4">
                            <Link href="/lists/new" className="btn-ghost"><Plus className="w-4 h-4" aria-hidden="true" /> Create list</Link>
                        </div>
                        {myLists.length > 0 ? (
                            <ul className="grid sm:grid-cols-2 gap-4">
                                {myLists.map((list) => <li key={list._id}><ListCard list={list} compact /></li>)}
                            </ul>
                        ) : (
                            <EmptyState icon={ListX} title="No lists yet">Create lists to organise your games.</EmptyState>
                        )}
                    </section>

                    <section>
                        <SectionHeader tag="Latest" title="My reviews" />
                        {reviews.data.length > 0 ? (
                            <ul className="space-y-3">
                                {reviews.data.map((review) => (
                                    <li key={review._id}>
                                        <ReviewCard
                                            review={review}
                                            showGame
                                            footer={
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditing(review)} className="btn-ghost !min-h-[44px]">
                                                        <Pencil className="w-4 h-4" aria-hidden="true" /> Edit
                                                    </button>
                                                    <button onClick={() => setDeleteId(review._id)} className="btn-ghost !min-h-[44px] hover:!border-hot hover:!text-hot" aria-label={`Delete review of ${review.game?.title ?? 'this game'}`}>
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
                                                    </button>
                                                </div>
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState icon={MessageSquare} title="No reviews yet" action={<Link href="/games" className="btn-primary"><Gamepad2 className="w-4 h-4" aria-hidden="true" /> Browse games</Link>}>
                                Find a game you&apos;ve played and write your first review.
                            </EmptyState>
                        )}
                    </section>
                </div>
            </div>

            <EditReviewModal key={editing?._id ?? 'none'} review={editing} onClose={() => setEditing(null)} onSaved={reviews.reload} />
            <ConfirmModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteReview(deleteId)}
                title="Delete review"
                message="This permanently deletes your review."
                confirmText="Delete"
            />
        </PageShell>
    );
}
