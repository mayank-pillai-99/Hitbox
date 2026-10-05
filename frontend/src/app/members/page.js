'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { UserX } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pager from '@/components/ui/Pager';
import ToggleGroup from '@/components/ui/ToggleGroup';
import FilterSearch from '@/components/ui/FilterSearch';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import MemberCard from '@/components/MemberCard';
import useApi from '@/hooks/useApi';

const LIMIT = 12;

function MembersContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const sort = searchParams.get('sort') === 'recent' ? 'recent' : 'reviews';
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

    const { data, loading, error, reload } = useApi('/users', { sort, page, limit: LIMIT, ...(q && { q }) });
    const members = data?.members ?? [];

    return (
        <PageShell>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in-up">
                <div className="max-w-2xl">
                    <p className="label text-neon">Community</p>
                    <h1 className="display text-4xl sm:text-6xl mt-2">
                        Meet the <span className="text-outline-lime">squad</span>
                    </h1>
                    <p className="mt-4 text-lg text-muted">
                        Connect with fellow gamers, discover their collections, and see what they&apos;re playing.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:items-center">
                    <FilterSearch key={q} label="Search members" value={q} onSubmit={(value) => update({ q: value })} placeholder="Search members" />
                    <ToggleGroup
                        label="Sort members"
                        options={[['reviews', 'Most reviews'], ['recent', 'Newest']]}
                        value={sort}
                        onChange={(value) => update({ sort: value === 'reviews' ? '' : value })}
                    />
                </div>
            </header>

            {loading ? (
                <CardGridSkeleton count={6} label="Loading members" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" />
            ) : error ? (
                <ErrorState message="Failed to load members." onRetry={reload} />
            ) : members.length === 0 ? (
                <EmptyState
                    icon={UserX}
                    title="No members found"
                    action={q && <button onClick={() => update({ q: '' })} className="btn-primary">Clear search</button>}
                >
                    {q ? `No members match "${q}".` : 'Check back soon.'}
                </EmptyState>
            ) : (
                <>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map((member) => (
                            <li key={member._id}><MemberCard member={member} /></li>
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

export default function MembersPage() {
    return (
        <Suspense fallback={<PageShell><CardGridSkeleton count={6} /></PageShell>}>
            <MembersContent />
        </Suspense>
    );
}
