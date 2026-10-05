'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, SearchX } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pager from '@/components/ui/Pager';
import { GameGridSkeleton } from '@/components/ui/Skeleton';
import GameCard from '@/components/GameCard';
import useApi from '@/hooks/useApi';

const GENRES = ['RPG', 'Action', 'Adventure', 'Shooter', 'Strategy'];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo'];
const SORT_OPTIONS = [
    { label: 'Popularity', value: '-added' },
    { label: 'Newest releases', value: '-released' },
    { label: 'Oldest releases', value: 'released' },
    { label: 'Top rated', value: '-rating' },
];

// One group of mutually exclusive filter buttons; clicking the active one clears it.
function FilterGroup({ label, options, value, onChange }) {
    return (
        <fieldset>
            <legend className="label text-neon mb-3">{label}</legend>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const active = value === option;
                    return (
                        <button
                            key={option}
                            onClick={() => onChange(active ? '' : option)}
                            aria-pressed={active}
                            className={`min-h-[44px] px-4 border text-sm font-bold uppercase tracking-wide transition-colors ${
                                active ? 'bg-neon text-black border-neon' : 'border-line-strong text-muted hover:border-neon hover:text-neon'
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

// All filters live in the URL, so a filtered view survives a reload and can be shared.
function BrowseGamesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const platform = searchParams.get('platform') || '';
    const sort = searchParams.get('sort') || '-added';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    const update = (changes) => {
        const next = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries({ page: '', ...changes })) {
            if (value) next.set(key, value);
            else next.delete(key);
        }
        const query = next.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    const { data, loading, error, reload } = useApi('/games', {
        page,
        ordering: sort,
        ...(search && { search }),
        ...(genre && { genres: genre }),
        ...(platform && { platforms: platform }),
    });

    const games = data?.results ?? [];
    const activeFilters = [genre, platform].filter(Boolean).length;

    return (
        <PageShell>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in-up">
                <div>
                    <p className="label text-neon">{search ? 'Search' : 'Catalog'}</p>
                    <h1 className="display text-4xl sm:text-6xl mt-2">
                        {search ? <>Results: <span className="text-outline-lime break-words">{search}</span></> : 'Browse games'}
                    </h1>
                </div>

                <div className="w-full md:w-64">
                    <label htmlFor="sort" className="label flex items-center gap-2 mb-1">
                        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" /> Sort by
                    </label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(e) => update({ sort: e.target.value === '-added' ? '' : e.target.value })}
                        disabled={Boolean(search)}
                        className="field"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {search && <p className="label mt-1">Search results are ordered by relevance.</p>}
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-64 shrink-0">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="filters"
                        className="btn-ghost w-full lg:hidden"
                    >
                        Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
                    </button>

                    <div id="filters" className={`${showFilters ? 'block' : 'hidden'} lg:block panel p-4 mt-3 lg:mt-0 space-y-6`}>
                        <FilterGroup label="Genre" options={GENRES} value={genre} onChange={(value) => update({ genre: value })} />
                        <FilterGroup label="Platform" options={PLATFORMS} value={platform} onChange={(value) => update({ platform: value })} />
                        {activeFilters > 0 && (
                            <button onClick={() => update({ genre: '', platform: '' })} className="btn-ghost w-full">
                                Clear filters
                            </button>
                        )}
                    </div>
                </aside>

                <section className="flex-1 min-w-0" aria-label="Games">
                    {loading ? (
                        <GameGridSkeleton count={12} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" />
                    ) : error ? (
                        <ErrorState message="Failed to load games." onRetry={reload} />
                    ) : games.length === 0 ? (
                        <EmptyState
                            icon={SearchX}
                            title="No games found"
                            action={activeFilters > 0 && <button onClick={() => update({ genre: '', platform: '' })} className="btn-primary">Clear filters</button>}
                        >
                            Try a different search or fewer filters.
                        </EmptyState>
                    ) : (
                        <>
                            <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                {games.map((game) => (
                                    <li key={game._id || game.igdbId}><GameCard game={game} /></li>
                                ))}
                            </ul>
                            <Pager page={page} hasNext={Boolean(data?.next)} onChange={(p) => update({ page: p > 1 ? String(p) : '' })} />
                        </>
                    )}
                </section>
            </div>
        </PageShell>
    );
}

export default function BrowseGames() {
    return (
        <Suspense fallback={<PageShell><GameGridSkeleton /></PageShell>}>
            <BrowseGamesContent />
        </Suspense>
    );
}
