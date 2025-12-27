'use client';

import { useState, useEffect } from 'react';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import { Trophy, Calendar, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import Link from 'next/link';

export default function Home() {
    const [trendingGames, setTrendingGames] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendingRes, newRes] = await Promise.all([
                    api.get('/games', { params: { ordering: '-added', page_size: 6 } }),
                    api.get('/games', { params: { ordering: '-added', dates: '2025-01-01,2025-12-31', page_size: 4 } })
                ]);
                setTrendingGames(trendingRes.data.results || trendingRes.data);
                setNewReleases(newRes.data.results || newRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch home data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            <div className="space-y-12 pb-12">
                {/* Hero Section */}
                <section className="relative bg-zinc-900 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                    <div className="relative max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
                            Track your <span className="text-emerald-500">gaming journey</span>.
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto mb-10">
                            Hitbox is the social network for gamers. Rate games, write reviews, and create lists of your favorites.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors">
                                Get Started
                            </Link>
                            <Link href="/games" className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors border border-zinc-700">
                                Browse Games
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    {/* Top Games Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Trophy className="text-emerald-500" />
                                <h2 className="text-2xl font-bold text-white">Top Games of All Time</h2>
                            </div>
                            <Link href="/games?ordering=-added" className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">View all</Link>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {trendingGames.map(game => (
                                    <GameCard key={game._id} game={game} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* New Releases Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-emerald-500" />
                                <h2 className="text-2xl font-bold text-white">New Releases</h2>
                            </div>
                            <Link href="/games?ordering=-released" className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">View all</Link>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {newReleases.map(game => (
                                    <GameCard key={game._id} game={game} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
