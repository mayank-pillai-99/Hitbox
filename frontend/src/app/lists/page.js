'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { List, Loader2, Gamepad2, User, MessageCircle, BarChart2 } from 'lucide-react';
import api from '@/utils/api';

export default function ListsDiscoveryPage() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('popular');

    useEffect(() => {
        const fetchLists = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/lists/discover?sort=${sortBy}`);
                setLists(res.data.lists || []);
            } catch (err) {
                console.error("Failed to fetch lists", err);
                setError('Failed to load lists');
            } finally {
                setLoading(false);
            }
        };

        fetchLists();
    }, [sortBy]);

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 animate-fade-in-up">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-lime-400/10 rounded-lg border border-lime-400/20">
                                <List className="w-6 h-6 text-lime-400" />
                            </span>
                            <span className="text-sm font-bold text-lime-400 uppercase tracking-widest">Collections</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                            Community <span className="text-outline-lime">Lists</span>
                        </h1>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                            Dive into curated collections from the Hitbox community. Discover hidden gems, themed plays, and masterpieces.
                        </p>
                    </div>

                    {/* Sort Toggles */}
                    <div className="flex p-1 bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10">
                        <button
                            onClick={() => setSortBy('popular')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${sortBy === 'popular'
                                ? 'bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Popular
                        </button>
                        <button
                            onClick={() => setSortBy('recent')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${sortBy === 'recent'
                                ? 'bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Recent
                        </button>
                    </div>
                </div>

                {/* Lists Grid */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
                            <p className="text-red-400 font-medium mb-2">{error}</p>
                            <button onClick={() => window.location.reload()} className="text-sm underline text-zinc-500 hover:text-white">Try Again</button>
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-white/5">
                            <List className="w-16 h-16 mx-auto mb-6 text-zinc-700" />
                            <h3 className="text-xl font-bold text-white mb-2">No lists found</h3>
                            <p className="text-zinc-500 mb-6">The archives are empty. Start your own collection!</p>
                            <Link href="/games" className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-colors">
                                <Gamepad2 className="w-4 h-4" /> Browse Games
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-1">
                            {lists.map(list => (
                                <ListCard key={list._id} list={list} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function ListCard({ list }) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/lists/${list._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
            {/* Game Covers Preview */}
            <div className="h-40 grid grid-cols-3 gap-0.5 bg-zinc-900 relative">
                {list.previewGames && list.previewGames.length > 0 ? (
                    <>
                        {list.previewGames.slice(0, 3).map((game, i) => (
                            <div key={i} className="relative h-full">
                                {game.coverImage ? (
                                    <img
                                        src={game.coverImage}
                                        alt={game.title}
                                        className="w-full h-full object-cover transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <Gamepad2 className="w-6 h-6 text-zinc-700" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Fill empty slots if less than 3 games */}
                        {[...Array(Math.max(0, 3 - list.previewGames.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="bg-zinc-800/50 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <Gamepad2 className="w-5 h-5 text-zinc-700" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-zinc-800/50 flex items-center justify-center">
                            <Gamepad2 className="w-8 h-8 text-zinc-700" />
                        </div>
                    ))
                )}
            </div>

            {/* List Info */}
            <div className="p-6 relative z-20 -mt-10">
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-xs font-bold text-lime-400 uppercase tracking-wider mb-2">
                        {list.gameCount} Games
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-lime-400 transition-colors line-clamp-1 leading-tight">
                        {list.name}
                    </h3>
                    {list.description && (
                        <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                            {list.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    {/* User Info */}
                    <Link
                        href={`/users/${list.user.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 group/user hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 group-hover/user:border-lime-400 overflow-hidden flex items-center justify-center transition-colors">
                            {list.user.profilePicture ? (
                                <img src={list.user.profilePicture} alt={list.user.username} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-zinc-500" />
                            )}
                        </div>
                        <span className="text-xs font-bold text-zinc-300 group-hover/user:text-white transition-colors">{list.user.username}</span>
                    </Link>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {list.commentCount || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
