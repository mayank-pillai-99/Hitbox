'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import api from '@/utils/api';
import FeedItem from './FeedItem';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import SectionHeader from '@/components/ui/SectionHeader';
import { ListRowsSkeleton } from '@/components/ui/Skeleton';

// Activity from the members you follow, newest first, loaded a page at a time.
export default function FollowFeed() {
    const [items, setItems] = useState([]);
    const [nextBefore, setNextBefore] = useState(null);
    const [following, setFollowing] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async (before) => {
        const { data } = await api.get('/feed', { params: { limit: 10, ...(before && { before }) } });
        setItems((prev) => (before ? [...prev, ...data.items] : data.items));
        setNextBefore(data.nextBefore);
        setFollowing(data.following);
    }, []);

    useEffect(() => {
        load()
            .catch(() => setError('Could not load your feed.'))
            .finally(() => setLoading(false));
    }, [load]);

    const loadMore = async () => {
        setLoadingMore(true);
        setError('');
        try {
            await load(nextBefore);
        } catch {
            setError('Could not load more.');
        } finally {
            setLoadingMore(false);
        }
    };

    const retry = () => {
        setLoading(true);
        setError('');
        load()
            .catch(() => setError('Could not load your feed.'))
            .finally(() => setLoading(false));
    };

    return (
        <section className="mb-12" aria-labelledby="following-heading">
            <SectionHeader tag="Following" title="Your feed" />
            <span id="following-heading" className="sr-only">Activity from members you follow</span>

            {loading ? (
                <ListRowsSkeleton count={3} />
            ) : error && items.length === 0 ? (
                <ErrorState message={error} onRetry={retry} />
            ) : following === 0 ? (
                <EmptyState icon={Users} title="You're not following anyone yet" action={<Link href="/members" className="btn-primary">Find members</Link>}>
                    Follow members to see their reviews, lists and updates here.
                </EmptyState>
            ) : items.length === 0 ? (
                <EmptyState icon={Users} title="Nothing new">The members you follow haven&apos;t been active lately.</EmptyState>
            ) : (
                <>
                    <ul className="space-y-3">
                        {items.map((item) => <FeedItem key={`${item.type}-${item._id}`} item={item} />)}
                    </ul>
                    {error && <p role="alert" className="mt-3 text-sm text-hot">{error}</p>}
                    {nextBefore && (
                        <button onClick={loadMore} disabled={loadingMore} className="btn-ghost w-full mt-3">
                            {loadingMore ? 'Loading...' : 'Load more'}
                        </button>
                    )}
                </>
            )}
        </section>
    );
}
