'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Calendar, Globe, User, Loader2, Heart, MessageSquare, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AddToListModal from '@/components/AddToListModal';
import GameStatusButtons from '@/components/GameStatusButtons';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';

export default function GameDetails({ params }) {
    const [game, setGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [gameId, setGameId] = useState(null);
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setGameId(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!gameId) return;

        const fetchData = async () => {
            try {
                const [gameRes, reviewsRes] = await Promise.all([
                    api.get(`/games/${gameId}`),
                    api.get(`/reviews/game/${gameId}`)
                ]);
                setGame(gameRes.data);
                setReviews(reviewsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch game details", err);
                setError('Failed to load game details.');
                setLoading(false);
            }
        };

        fetchData();
    }, [gameId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p className="text-red-400 font-medium">{error || 'Game not found'}</p>
                <Link href="/games" className="text-lime-400 hover:text-lime-300 font-bold uppercase tracking-wide">Back to Games</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-[80vh] overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10" />
                {game.coverImage && (
                    <img
                        src={game.coverImage}
                        alt=""
                        className="w-full h-full object-cover opacity-50 blur-sm scale-110"
                    />
                )}
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10 pt-24 md:pt-48">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="md:sticky md:top-24 w-full md:w-80 flex-shrink-0 animate-fade-in-up">
                        <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 transition-transform duration-500 hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                            {game.coverImage ? (
                                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold bg-zinc-800">No Image</div>
                            )}
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-lime-400/50 transition-all duration-500 z-30" />
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                                <div className="text-sm text-zinc-400 mb-1 font-medium">Rating</div>
                                <div className="text-2xl font-black text-lime-400 flex items-center justify-center gap-1">
                                    <Star className="w-5 h-5 fill-current" />
                                    {game.averageRating ? game.averageRating.toFixed(1) : 'NR'}
                                </div>
                            </div>
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                                <div className="text-sm text-zinc-400 mb-1 font-medium">Release</div>
                                <div className="text-xl font-bold text-white">
                                    {game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBA'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GameStatusButtons gameId={gameId} />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 animate-fade-in-up stagger-1">
                        <div className="mb-2 flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-bold uppercase tracking-wider border border-lime-400/20">
                                {game.platforms?.[0] || 'Game'}
                            </span>
                            {game.developer && (
                                <span className="flex items-center gap-1 text-zinc-400 text-sm font-medium">
                                    <Globe className="w-3.5 h-3.5" />
                                    {game.developer}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tight leading-none text-glow">
                            {game.title}
                        </h1>

                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 shadow-xl">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-lime-400"></span>
                                Synopsis
                            </h3>
                            <p className="text-lg text-zinc-300 leading-relaxed font-light">
                                {game.description || "No description available for this title."}
                            </p>

                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Genres</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {game.genre?.map(g => (
                                            <span key={g} className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-200">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Platforms</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {game.platforms?.map(p => (
                                            <span key={p} className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-200">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-16">
                            {user ? (
                                <Link
                                    href={`/games/${game._id}/review`}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-black px-8 py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                                >
                                    <Star className="w-4 h-4" /> Rate & Review
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-black px-8 py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all transform hover:scale-105"
                                >
                                    Login to Review
                                </Link>
                            )}

                            <button
                                onClick={() => user ? setIsListModalOpen(true) : alert("Please login to add to lists")}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3.5 rounded-xl font-bold uppercase tracking-wide transition-colors"
                            >
                                <Share2 className="w-4 h-4" /> Add to List
                            </button>
                        </div>

                        <div className="animate-fade-in-up stagger-2">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-lime-400" />
                                    Community Reviews
                                </h3>
                                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{reviews.length} Reviews</span>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="backdrop-blur-sm bg-white/5 border border-dashed border-zinc-700 rounded-2xl p-12 text-center">
                                    <p className="text-zinc-500 font-medium mb-4">No reviews yet.</p>
                                    <p className="text-sm text-zinc-600 uppercase tracking-wider">Be the legend who writes the first one.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review._id} className="group backdrop-blur-md bg-white/5 border border-white/5 hover:border-lime-400/30 rounded-2xl p-6 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-zinc-800">
                                                        {review.user?.profilePicture ? (
                                                            <img src={review.user.profilePicture} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-lime-400/20 text-lime-400">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link href={`/users/${review.user?.username}`} className="font-bold text-white hover:text-lime-400 transition-colors block leading-tight">
                                                            {review.user?.username || 'Unknown User'}
                                                        </Link>
                                                        <span className="text-xs text-zinc-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <Star className="w-4 h-4 text-lime-400 fill-current" />
                                                    <span className="text-sm font-bold text-white">{review.rating}</span>
                                                </div>
                                            </div>

                                            {review.text && <p className="text-zinc-300 text-sm leading-relaxed mb-4">{review.text}</p>}

                                            <div className="flex items-center justify-end border-t border-white/5 pt-4">
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        if (!user) return alert('Please login to like reviews');
                                                        try {
                                                            const isLiked = review.likes?.includes(user._id);
                                                            if (isLiked) {
                                                                await api.delete(`/reviews/${review._id}/like`);
                                                            } else {
                                                                await api.post(`/reviews/${review._id}/like`);
                                                            }
                                                            const res = await api.get(`/reviews/game/${gameId}`);
                                                            setReviews(res.data);
                                                        } catch (err) {
                                                            console.error('Failed to toggle like', err);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 ${review.likes?.includes(user?._id) ? 'text-rose-500' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    <Heart className={`w-4 h-4 ${review.likes?.includes(user?._id) ? 'fill-current' : ''}`} />
                                                    <span>{review.likesCount || 0} Likes</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AddToListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                gameId={gameId}
            />

            <Footer />
        </div>
    );
}
