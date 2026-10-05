'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Plus, ListX } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pager from '@/components/ui/Pager';
import ToggleGroup from '@/components/ui/ToggleGroup';
import FilterSearch from '@/components/ui/FilterSearch';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import ListCard from '@/components/ListCard';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

const LIMIT = 12;

function ListsContent() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const sort = searchParams.get('sort') === 'recent' ? 'recent' : 'popular';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const q = searchParams.get('q') || '';

    const update = (changes) => {
        const next = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries({ page: '', ...changes })) {
            if (value) next.set(key, value);
            else next.delete(key);
        }
        const query = next.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    const { data, loading, error, reload } = useApi('/lists/discover', { sort, page, limit: LIMIT, ...(q && { q }) });
    const lists = data?.lists ?? [];

    return (
        <PageShell>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in-up">
                <div className="max-w-2xl">
                    <p className="label text-neon">Collections</p>
                    <h1 className="display text-4xl sm:text-6xl mt-2">
                        Community <span className="text-outline-lime">lists</span>
                    </h1>
                    <p className="mt-4 text-lg text-muted">
                        Curated collections from the Hitbox community: hidden gems, themed plays and favourites.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:items-center">
                    <FilterSearch key={q} label="Search lists" value={q} onSubmit={(value) => update({ q: value })} placeholder="Search lists" />
                    <ToggleGroup
                        label="Sort lists"
                        options={[['popular', 'Popular'], ['recent', 'Recent']]}
                        value={sort}
                        onChange={(value) => update({ sort: value === 'popular' ? '' : value })}
                    />
                    {user && (
                        <Link href="/lists/new" className="btn-primary">
                            <Plus className="w-4 h-4" aria-hidden="true" /> New list
                        </Link>
                    )}
                </div>
            </header>

            {loading ? (
                <CardGridSkeleton count={6} label="Loading lists" />
            ) : error ? (
                <ErrorState message="Failed to load lists." onRetry={reload} />
            ) : lists.length === 0 ? (
                <EmptyState
                    icon={ListX}
                    title={q ? 'No lists found' : 'No lists yet'}
                    action={
                        q ? <button onClick={() => update({ q: '' })} className="btn-primary">Clear search</button>
                        : user ? <Link href="/lists/new" className="btn-primary">Create the first list</Link>
                        : <Link href="/signup" className="btn-primary">Join to create one</Link>
                    }
                >
                    {q ? `No lists match "${q}".` : 'Be the first to share a collection.'}
                </EmptyState>
            ) : (
                <>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.map((list) => (
                            <li key={list._id}><ListCard list={list} /></li>
                        ))}
                    </ul>
                    <Pager
                        page={page}
                        totalPages={data.pagination?.total}
                        onChange={(p) => update({ page: p > 1 ? String(p) : '' })}
                    />
                </>
            )}
        </PageShell>
    );
}

export default function ListsDiscoveryPage() {
    return (
        <Suspense fallback={<PageShell><CardGridSkeleton count={6} /></PageShell>}>
            <ListsContent />
        </Suspense>
    );
}
