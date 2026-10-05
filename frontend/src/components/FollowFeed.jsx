'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import FeedItem from './FeedItem';

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
        try {
            await load(nextBefore);
        } catch {
            setError('Could not load more.');
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-8">
                <Users className="w-6 h-6 text-lime-400" />
                <h2 className="text-2xl font-black text-white italic tracking-tighter">FOLLOWING</h2>
            </div>

            {loading ? (
                <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
            ) : error && items.length === 0 ? (
                <p className="text-zinc-500">{error}</p>
            ) : following === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-zinc-700 text-center text-zinc-500">
                    You&apos;re not following anyone yet.{' '}
                    <Link href="/members" className="text-lime-400 font-bold hover:underline">Find members</Link>
                </div>
            ) : items.length === 0 ? (
                <p className="text-zinc-500">Nothing new from the members you follow.</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => <FeedItem key={`${item.type}-${item._id}`} item={item} />)}
                    {nextBefore && (
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-300 hover:text-white hover:border-lime-400/40 transition-colors disabled:opacity-60"
                        >
                            {loadingMore ? 'Loading...' : 'Load more'}
                        </button>
                    )}
                    {error && <p className="text-sm text-rose-400">{error}</p>}
                </div>
            )}
        </div>
    );
}
