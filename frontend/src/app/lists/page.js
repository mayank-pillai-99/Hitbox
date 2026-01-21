'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { List, Loader2, Gamepad2, User, MessageCircle } from 'lucide-react';
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
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 py-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-4 flex items-center justify-center gap-3 uppercase">
                        <List className="w-10 h-10 text-lime-400" />
                        Lists
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Discover curated game collections from the community.
                    </p>
                </div>
            </div>

            {/* Sort Options */}
            <div className="max-w-6xl mx-auto px-4 pt-8">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm text-zinc-500">Sort by:</span>
                    <button
                        onClick={() => setSortBy('popular')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortBy === 'popular'
                            ? 'bg-lime-400/20 text-lime-300 border border-lime-400/50'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                            }`}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortBy === 'recent'
                            ? 'bg-lime-400/20 text-lime-300 border border-lime-400/50'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                            }`}
                    >
                        Recent
                    </button>
                </div>
            </div>

            {/* Lists Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-12">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-400">{error}</div>
                ) : lists.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No lists found yet</p>
                        <p className="text-sm mt-2">Be the first to create a list!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map(list => (
                            <ListCard key={list._id} list={list} />
                        ))}
                    </div>
                )}
            </div>
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
            className="group bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer"
        >
            {/* Game Covers Preview */}
            <div className="h-32 flex gap-0.5 overflow-hidden bg-zinc-800">
                {list.previewGames && list.previewGames.length > 0 ? (
                    list.previewGames.map((game, i) => (
                        <div
                            key={i}
                            className="flex-1 min-w-0"
                        >
                            {game.coverImage ? (
                                <img
                                    src={game.coverImage}
                                    alt={game.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                    <Gamepad2 className="w-6 h-6 text-zinc-600" />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <Gamepad2 className="w-12 h-12 text-zinc-700" />
                    </div>
                )}
            </div>

            {/* List Info */}
            <div className="p-4">
                <h3 className="font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-1">
                    {list.name}
                </h3>
                {list.description && (
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{list.description}</p>
                )}

                <div className="flex items-center justify-between mt-4">
                    {/* User Info */}
                    <Link
                        href={`/users/${list.user.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 hover:text-lime-300 transition-colors"
                    >
                        <div className="w-6 h-6 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
                            {list.user.profilePicture ? (
                                <img src={list.user.profilePicture} alt={list.user.username} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-3 h-3 text-zinc-500" />
                            )}
                        </div>
                        <span className="text-sm text-zinc-400">{list.user.username}</span>
                    </Link>

                    {/* Game & Comment Count */}
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Gamepad2 className="w-3.5 h-3.5" />
                            {list.gameCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {list.commentCount || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
