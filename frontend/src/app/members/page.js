'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Users, Loader2, Gamepad2, Star, List } from 'lucide-react';
import api from '@/utils/api';

export default function MembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/users');
                setMembers(res.data.members || []);
            } catch (err) {
                console.error("Failed to fetch members", err);
                setError('Failed to load members');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-20 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                        <Users className="w-4 h-4 text-lime-400" />
                        <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">Global Community</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                        Meet the <span className="text-outline-lime">Squad</span>
                    </h1>

                    <p className="text-zinc-400 text-lg max-w-2xl font-medium leading-relaxed">
                        Connect with fellow gamers, discover their collections, and see what they're playing.
                        Join the ranks of the Hitbox elite.
                    </p>
                </div>

                {/* Members Grid */}
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
                    ) : members.length === 0 ? (
                        <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-white/5">
                            <Users className="w-16 h-16 mx-auto mb-6 text-zinc-700" />
                            <h3 className="text-xl font-bold text-white mb-2">No members found</h3>
                            <p className="text-zinc-500 mb-6">Be the first to join!</p>
                            <Link href="/signup" className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-colors">
                                Join Now
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up stagger-1">
                            {members.map(member => (
                                <MemberCard key={member._id} member={member} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function MemberCard({ member }) {
    return (
        <Link
            href={`/users/${member.username}`}
            className="group relative flex flex-col backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full"
        >
            <div className="p-6 flex flex-col items-center text-center flex-grow relative z-10">
                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-zinc-800 to-zinc-700 group-hover:from-lime-400 group-hover:to-lime-200 transition-colors duration-300">
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-black">
                            {member.profilePicture ? (
                                <img
                                    src={member.profilePicture}
                                    alt={member.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <User className="w-10 h-10 text-zinc-600" />
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Info */}
                <h3 className="text-xl font-black text-white group-hover:text-lime-400 transition-colors mb-1 truncate w-full">
                    {member.username}
                </h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Member</p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-2 w-full mb-6">
                    <div className="flex-1 bg-black/40 rounded-lg py-2 border border-white/5">
                        <div className="text-lg font-bold text-white leading-none mb-1">{member.stats.reviews}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reviews</div>
                    </div>
                    <div className="flex-1 bg-black/40 rounded-lg py-2 border border-white/5">
                        <div className="text-lg font-bold text-white leading-none mb-1">{member.stats.lists}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lists</div>
                    </div>
                </div>
            </div>

            {/* Recent Games Strip */}
            <div className="bg-black/40 border-t border-white/5 p-3">
                <div className="flex justify-center gap-2 h-16">
                    {member.recentGames && member.recentGames.length > 0 ? (
                        <>
                            {member.recentGames.slice(0, 4).map((game, i) => (
                                <div
                                    key={i}
                                    className="w-12 h-16 rounded bg-zinc-800 border border-white/10 overflow-hidden relative group/game"
                                    title={game.title}
                                >
                                    <img
                                        src={game.coverImage}
                                        alt={game.title}
                                        className="w-full h-full object-cover opacity-80 group-hover/game:opacity-100 transition-opacity"
                                    />
                                </div>
                            ))}
                            {[...Array(Math.max(0, 4 - member.recentGames.length))].map((_, i) => (
                                <div key={`empty-${i}`} className="w-12 h-16 rounded bg-white/5 border border-white/5 flex items-center justify-center">
                                    <Gamepad2 className="w-4 h-4 text-zinc-700" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="w-full text-center flex items-center justify-center gap-2 text-xs text-zinc-600 font-medium">
                            <Gamepad2 className="w-4 h-4" /> No recent activity
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
