'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import api from '@/utils/api';

const GENRES = ["All", "RPG", "Action", "Adventure", "Shooter", "Strategy"];
const PLATFORMS = ["All", "PC", "PlayStation", "Xbox", "Nintendo"];

function BrowseGamesContent() {
    const [games, setGames] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter States
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [sortBy, setSortBy] = useState('-added'); // Default: Popularity
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search');

    const toggleSort = () => setIsSortOpen(!isSortOpen);

    const handleSortChange = (value) => {
        setSortBy(value);
        setIsSortOpen(false);
        setPage(1);
    };

    const SORT_OPTIONS = [
        { label: 'Popularity', value: '-added' },
        { label: 'Newest Releases', value: '-released' },
        { label: 'Oldest Releases', value: 'released' },
        { label: 'Top Rated', value: '-rating' },
    ];

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    page_size: 20,
                    ordering: sortBy
                };

                if (searchQuery) params.search = searchQuery;
                if (selectedGenre !== 'All') params.genres = selectedGenre;
                if (selectedPlatform !== 'All') params.platforms = selectedPlatform;

                const res = await api.get('/games', { params });

                // Handle new response structure { results, count, next, previous }
                // Fallback to older array structure if backend wasn't fully updated or errored in a specific way (unlikely with our edit)
                const results = res.data.results || res.data;
                setGames(results);
                setHasMore(!!res.data.next);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load games. Please try again later.');
                setLoading(false);
            }
        };

        fetchGames();
    }, [searchQuery, selectedGenre, selectedPlatform, page, sortBy]);

    // Reset page on filter change
    const handleGenreChange = (genre) => {
        setSelectedGenre(genre);
        setPage(1);
    };

    const handlePlatformChange = (platform) => {
        setSelectedPlatform(platform);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-white">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Games'}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={toggleSort}
                                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Sort by: {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
                            </button>

                            {/* Dropdown Menu */}
                            {isSortOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-zinc-800 ${sortBy === option.value ? 'text-emerald-500 font-medium' : 'text-zinc-300'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-white mb-4">
                                <Filter className="w-4 h-4 text-emerald-500" /> Filters
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Genre</h4>
                                    <div className="space-y-2">
                                        {GENRES.map(genre => (
                                            <label key={genre}
                                                className="flex items-center gap-2 cursor-pointer group"
                                                onClick={() => handleGenreChange(genre)}
                                            >
                                                <div className={`w-4 h-4 rounded border transition-colors ${selectedGenre === genre ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'} flex items-center justify-center`}>
                                                    {selectedGenre === genre && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-sm ${selectedGenre === genre ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{genre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Platform</h4>
                                    <div className="space-y-2">
                                        {PLATFORMS.map(platform => (
                                            <label key={platform}
                                                className="flex items-center gap-2 cursor-pointer group"
                                                onClick={() => handlePlatformChange(platform)}
                                            >
                                                <div className={`w-4 h-4 rounded border transition-colors ${selectedPlatform === platform ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'} flex items-center justify-center`}>
                                                    {selectedPlatform === platform && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-sm ${selectedPlatform === platform ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{platform}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Games Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-400 py-12">{error}</div>
                        ) : games.length === 0 ? (
                            <div className="text-center text-zinc-500 py-12">No games found.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {games.map(game => (
                                    <GameCard key={game._id} game={game} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && games.length > 0 && (
                            <div className="mt-12 flex justify-center gap-2 items-center">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-zinc-500 text-sm px-2">Page {page}</span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={!hasMore}
                                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BrowseGames() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        }>
            <BrowseGamesContent />
        </Suspense>
    );
}
