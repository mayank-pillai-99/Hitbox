'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Calendar, Star, List, Loader2, Gamepad2, ArrowRight, Heart, MessageSquare } from 'lucide-react';
import api from '@/utils/api';
import Footer from '@/components/Footer';

export default function PublicUserProfile({ params }) {
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('reviews');
    const [username, setUsername] = useState(null);

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setUsername(resolvedParams.username);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!username) return;

        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/${username}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch user profile", err);
                setError('User not found');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    useEffect(() => {
        if (!username) return;

        const fetchReviews = async () => {
            try {
                const res = await api.get(`/users/${username}/reviews`);
                setReviews(res.data.reviews || []);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            }
        };

        const fetchLists = async () => {
            try {
                const res = await api.get(`/users/${username}/lists`);
                setLists(res.data || []);
            } catch (err) {
                console.error("Failed to fetch lists", err);
            }
        };

        fetchReviews();
        fetchLists();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center flex-col gap-4">
                <div className="text-6xl font-black text-zinc-800">404</div>
                <p className="text-zinc-400 font-medium text-lg">{error || 'User not found'}</p>
                <Link href="/members" className="text-lime-400 hover:text-lime-300 font-bold uppercase tracking-wide flex items-center gap-2 transition-colors">
                    Browse Members <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            <div className="relative h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-50" />

                {reviews.length > 0 && reviews[0].game?.coverImage && (
                    <img
                        src={reviews[0].game.coverImage}
                        className="w-full h-full object-cover opacity-20 blur-xl scale-110"
                        alt=""
                    />
                )}
            </div>

            <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 -mt-32">
                <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-zinc-800 to-zinc-700 group-hover:from-lime-400 group-hover:to-lime-200 transition-colors duration-500 shadow-2xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black border-4 border-black relative">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <span className="text-5xl font-black text-zinc-700 group-hover:text-lime-400 transition-colors">
                                            {profile.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 pb-4">
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-2 uppercase italic tracking-tighter leading-none text-glow">
                            {profile.username}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-medium mb-4">
                            <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(profile.createdAt).getFullYear()} Member
                            </span>
                            {profile.bio && (
                                <span className="border-l border-zinc-700 pl-4 italic text-zinc-500 max-w-lg truncate">
                                    "{profile.bio}"
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pb-4">
                        <div className="bg-zinc-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center min-w-[100px] shadow-lg">
                            <div className="text-3xl font-black text-white leading-none mb-1">{profile.stats.reviews}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reviews</div>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center min-w-[100px] shadow-lg">
                            <div className="text-3xl font-black text-white leading-none mb-1">{profile.stats.lists}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lists</div>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center min-w-[100px] shadow-lg">
                            <div className="text-3xl font-black text-white leading-none mb-1">{profile.stats.gamesPlayed || 0}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Games</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-2">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 mb-2">Feeds</h3>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all flex items-center justify-between group ${activeTab === 'reviews'
                                    ? 'bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4" /> Reviews
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-md ${activeTab === 'reviews' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400'}`}>
                                    {reviews.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('lists')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all flex items-center justify-between group ${activeTab === 'lists'
                                    ? 'bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <List className="w-4 h-4" /> Lists
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-md ${activeTab === 'lists' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400'}`}>
                                    {lists.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {activeTab === 'reviews' && (
                            <div className="space-y-4 animate-fade-in-up">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                        <Star className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                                        <p className="text-zinc-500 text-lg font-medium">No reviews yet</p>
                                        <p className="text-zinc-600 text-sm mt-1">When {profile.username} reviews games, they'll appear here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {reviews.map(review => (
                                            <Link
                                                key={review._id}
                                                href={`/games/${review.game?._id || review.game}`}
                                                className="group flex gap-6 p-6 bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-lime-400/30 rounded-2xl transition-all duration-300 hover:transform hover:scale-[1.01] hover:shadow-xl"
                                            >
                                                <div className="w-20 h-28 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10 group-hover:border-lime-400/50 transition-colors relative">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {review.game?.coverImage ? (
                                                        <img src={review.game.coverImage} alt={review.game.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Gamepad2 className="w-6 h-6 text-zinc-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 py-1">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="text-xl font-bold text-white group-hover:text-lime-400 transition-colors truncate">
                                                            {review.game?.title || 'Unknown Game'}
                                                        </h3>
                                                        <div className="flex gap-1 flex-shrink-0 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                                            <Star className="w-4 h-4 text-lime-400 fill-current" />
                                                            <span className="text-sm font-bold text-white">{review.rating}</span>
                                                        </div>
                                                    </div>

                                                    {(review.text || review.content) && (
                                                        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-3 font-medium">
                                                            "{review.text || review.content}"
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-4 text-xs text-zinc-600 font-bold uppercase tracking-wider">
                                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        {review.likesCount > 0 && (
                                                            <span className="flex items-center gap-1 text-zinc-500">
                                                                <Heart className="w-3 h-3 text-red-500 fill-current" /> {review.likesCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'lists' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                                {lists.length === 0 ? (
                                    <div className="col-span-2 text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                        <List className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                                        <p className="text-zinc-500 text-lg font-medium">No lists created yet</p>
                                        <p className="text-zinc-600 text-sm mt-1">When {profile.username} creates lists, they'll appear here.</p>
                                    </div>
                                ) : (
                                    lists.map(list => (
                                        <Link
                                            key={list._id}
                                            href={`/lists/${list._id}`}
                                            className="group bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-lime-400/50 hover:bg-zinc-900/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1 block h-full"
                                        >
                                            <div className="flex h-32 border-b border-white/5 relative">
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent z-10" />
                                                {list.previewGames && list.previewGames.length > 0 ? (
                                                    list.previewGames.slice(0, 3).map((game, i) => (
                                                        <div key={i} className="flex-1 bg-zinc-800 relative border-r border-black/20">
                                                            {game.coverImage ? (
                                                                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Gamepad2 className="w-6 h-6 text-zinc-700" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex-1 bg-zinc-800 flex items-center justify-center">
                                                        <Gamepad2 className="w-8 h-8 text-zinc-700" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="bg-lime-400/10 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-lime-400/20">
                                                        {list.gameCount} Games
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-lime-400 transition-colors -rotate-45 group-hover:rotate-0 transform duration-300" />
                                                </div>
                                                <h3 className="text-lg font-black text-white group-hover:text-lime-400 transition-colors mb-1 truncate">{list.name}</h3>
                                                {list.description && (
                                                    <p className="text-zinc-500 text-sm line-clamp-2 font-medium leading-relaxed">{list.description}</p>
                                                )}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
