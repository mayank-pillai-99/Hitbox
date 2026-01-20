'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Users, Loader2, Gamepad2 } from 'lucide-react';
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

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 py-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-4 flex items-center justify-center gap-3 uppercase">
                        <Users className="w-10 h-10 text-lime-400" />
                        Members
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Gamers, critics and friends — find popular members.
                    </p>
                </div>
            </div>

            {/* Members Grid */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {error ? (
                    <div className="text-center py-12 text-red-400">{error}</div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No members found yet</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">
                            Featured Members
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {members.map(member => (
                                <MemberCard key={member._id} member={member} />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

function MemberCard({ member }) {
    return (
        <Link
            href={`/users/${member.username}`}
            className="group text-center"
        >
            {/* Profile Picture */}
            <div className="w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden border-4 border-zinc-800 group-hover:border-lime-400/50 transition-colors bg-zinc-900">
                {member.profilePicture ? (
                    <img
                        src={member.profilePicture}
                        alt={member.username}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-zinc-600" />
                    </div>
                )}
            </div>

            {/* Username */}
            <h3 className="font-bold text-white group-hover:text-lime-400 transition-colors truncate">
                {member.username}
            </h3>

            {/* Stats */}
            <p className="text-xs text-zinc-500 mt-1">
                {member.stats.reviews} reviews • {member.stats.lists} lists
            </p>

            {/* Recent Games Row */}
            <div className="flex justify-center gap-1 mt-3 h-12">
                {member.recentGames && member.recentGames.length > 0 ? (
                    member.recentGames.slice(0, 4).map((game, i) => (
                        <div
                            key={i}
                            className="w-8 h-12 rounded overflow-hidden bg-zinc-800"
                        >
                            <img
                                src={game.coverImage}
                                alt={game.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center text-zinc-700">
                        <Gamepad2 className="w-6 h-6" />
                    </div>
                )}
            </div>
        </Link>
    );
}
