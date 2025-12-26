'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import api from '@/utils/api';

const GENRES = ["All", "RPG", "Action", "Adventure", "Shooter", "Roguelike", "Strategy"];
const PLATFORMS = ["All", "PC", "PlayStation", "Xbox", "Nintendo"];

export default function BrowseGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await api.get('/games');
                setGames(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch games", err);
                setError('Failed to load games. Please try again later.');
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-white">Browse Games</h1>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Sort Dropdown (Mock) */}
                        <div className="relative">
                            <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                Sort by: Popularity
                            </button>
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
                                            <label key={genre} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border ${genre === 'All' ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'} flex items-center justify-center`}>
                                                    {genre === 'All' && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-sm ${genre === 'All' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{genre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Platform</h4>
                                    <div className="space-y-2">
                                        {PLATFORMS.map(platform => (
                                            <label key={platform} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border ${platform === 'All' ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'} flex items-center justify-center`}>
                                                    {platform === 'All' && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-sm ${platform === 'All' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{platform}</span>
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

                        {/* Pagination (Mock - Hidden if no games) */}
                        {!loading && !error && games.length > 0 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 disabled:opacity-50" disabled>Previous</button>
                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">1</button>
                                <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800">2</button>
                                <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800">3</button>
                                <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800">Next</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
