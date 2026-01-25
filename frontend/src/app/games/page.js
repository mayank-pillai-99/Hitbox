'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import { Filter, SlidersHorizontal, Loader2, Search, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '@/utils/api';

const GENRES = ["All", "RPG", "Action", "Adventure", "Shooter", "Strategy"];
const PLATFORMS = ["All", "PC", "PlayStation", "Xbox", "Nintendo"];

function BrowseGamesContent() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter States
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [sortBy, setSortBy] = useState('-added');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

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

    const handleGenreChange = (genre) => {
        setSelectedGenre(genre);
        setPage(1);
    };

    const handlePlatformChange = (platform) => {
        setSelectedPlatform(platform);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase italic leading-none mb-2">
                            {searchQuery ? `Results: "${searchQuery}"` : 'Browse Games'}
                        </h1>
                        <p className="text-zinc-400 font-medium">
                            Discover your next obsession from our curated database.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative z-20 w-full md:w-auto">
                            <button
                                onClick={toggleSort}
                                className="w-full md:w-56 flex items-center justify-between gap-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 px-5 py-3 rounded-xl text-sm font-bold text-white hover:border-lime-400 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-lime-400" />
                                    <span>Sort: <span className="text-zinc-400 font-normal">{SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}</span></span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSortOpen && (
                                <div className="absolute right-0 mt-2 w-full md:w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            className="w-full text-left px-5 py-3 text-sm transition-colors hover:bg-white/5 flex items-center justify-between group"
                                        >
                                            <span className={sortBy === option.value ? 'text-lime-400 font-bold' : 'text-zinc-300 group-hover:text-white'}>
                                                {option.label}
                                            </span>
                                            {sortBy === option.value && <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                    >
                        <Filter className="w-4 h-4 text-lime-400" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Filters Sidebar */}
                    <aside className={`w-full lg:w-72 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'} animate-fade-in-up stagger-1`}>
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h3 className="flex items-center gap-2 font-black text-white uppercase tracking-wider mb-6 pb-4 border-b border-white/5">
                                <Filter className="w-4 h-4 text-lime-400" /> Filters
                            </h3>

                            <div className="space-y-8">
                                {/* Genres */}
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Genre</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRES.map(genre => (
                                            <button
                                                key={genre}
                                                onClick={() => handleGenreChange(genre)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGenre === genre
                                                    ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                                                    }`}
                                            >
                                                {genre}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Platforms */}
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Platform</h4>
                                    <div className="space-y-1">
                                        {PLATFORMS.map(platform => (
                                            <button
                                                key={platform}
                                                onClick={() => handlePlatformChange(platform)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${selectedPlatform === platform
                                                    ? 'bg-white/10 text-white font-bold'
                                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span>{platform}</span>
                                                {selectedPlatform === platform && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Games Grid */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-zinc-900/50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <p className="text-red-400 font-medium mb-2">{error}</p>
                                <button onClick={() => window.location.reload()} className="text-sm underline text-zinc-500 hover:text-white">Try Again</button>
                            </div>
                        ) : games.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                                <Search className="w-12 h-12 text-zinc-700 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
                                <p className="text-zinc-500">Try adjusting your filters or search terms.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up stagger-2">
                                {games.map(game => (
                                    <GameCard key={game._id} game={game} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && games.length > 0 && (
                            <div className="mt-16 flex justify-center gap-4 items-center">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full text-white hover:border-lime-400 hover:text-lime-400 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-white transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="text-sm font-bold text-zinc-500 tracking-widest px-4">
                                    PAGE <span className="text-white">{page}</span>
                                </div>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={!hasMore}
                                    className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full text-white hover:border-lime-400 hover:text-lime-400 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-white transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function BrowseGames() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
        }>
            <BrowseGamesContent />
        </Suspense>
    );
}
