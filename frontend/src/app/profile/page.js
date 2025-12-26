'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Loader2, Plus } from 'lucide-react';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchLists = async () => {
            try {
                const res = await api.get('/lists');
                setLists(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch lists", err);
                setError('Failed to load profile.');
                setLoading(false);
            }
        };

        fetchLists();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p>Please login to view your profile.</p>
                <Link href="/login" className="text-emerald-500 hover:underline">Login</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    // Calculate basic stats
    const stats = {
        gamesPlayed: user.stats?.gamesPlayed || 0,
        reviews: user.stats?.reviews || 0,
        lists: user.stats?.lists || lists.length || 0
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            <div className="bg-zinc-900 border-b border-zinc-800 pt-10 pb-10 px-4">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl bg-zinc-800 flex items-center justify-center">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.username || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-zinc-500">{(user.username ? user.username.charAt(0) : 'U').toUpperCase()}</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-white">{user.username || 'User'}</h1>
                            <Link href="/settings" className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 transition-colors border border-zinc-700">
                                <Settings className="w-4 h-4" /> Edit Profile
                            </Link>
                        </div>
                        <p className="text-zinc-400 mb-6 max-w-md">{user.bio || "No bio yet."}</p>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 border-t border-zinc-800 pt-4">
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Games</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{stats.reviews}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{stats.lists}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Lists</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
                {/* Lists Section */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
                    <h2 className="text-2xl font-bold text-white">My Lists</h2>
                    <Link href="/lists/new" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        <Plus className="w-4 h-4" /> New List
                    </Link>
                </div>

                {lists.length > 0 ? (
                    <div className="grid gap-12">
                        {lists.map(list => (
                            <section key={list._id}>
                                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                                    <h3 className="text-xl font-bold text-white">{list.name} <span className="text-zinc-500 text-sm font-normal">({list.games.length})</span></h3>
                                    <Link href={`/lists/${list._id}`} className="text-sm text-emerald-500 hover:text-emerald-400">View details</Link>
                                </div>

                                {list.games && list.games.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                        {list.games.slice(0, 6).map(game => (
                                            <GameCard key={game._id} game={game} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900/50 rounded-lg p-8 text-center border border-zinc-800 border-dashed">
                                        <p className="text-zinc-500">No games in this list yet.</p>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-zinc-400 mb-4">You haven't created any lists yet.</p>
                        <Link href="/lists/new" className="text-emerald-500 hover:underline">Create your first list</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
