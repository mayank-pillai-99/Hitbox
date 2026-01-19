'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Calendar, Globe, User, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AddToListModal from '@/components/AddToListModal';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function GameDetails({ params }) {
    const [game, setGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    // Unwrap params using React.use() or await if necessary in newer Next.js, but params is a promise in the latest versions.
    // However, for this client component structure, assuming basic params usage.
    // NOTE: In Next.js 15+, params is async. Let's handle it safely.
    // NOTE: In Next.js 15+, params is async. Let's handle it safely.
    const [gameId, setGameId] = useState(null);
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    useEffect(() => {
        // safely unwrap params
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
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p className="text-red-400">{error || 'Game not found'}</p>
                <Link href="/games" className="text-emerald-500 hover:underline">Back to Games</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            {/* Backdrop */}
            <div className="relative h-[40vh] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent z-10"></div>
                {game.coverImage && (
                    <img
                        src={game.coverImage} // Using cover as backdrop for now since we don't have separate backdrop in schema
                        alt={game.title}
                        className="w-full h-full object-cover opacity-30 blur-sm"
                    />
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Image */}
                    {/* Cover Image */}
                    <div className="flex-shrink-0 mx-auto md:mx-0 w-64 aspect-[3/4] rounded-lg shadow-2xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
                        {game.coverImage ? (
                            <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
                        )}
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 text-center md:text-left pt-4 md:pt-32">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{game.title}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400 mb-6">
                            {game.releaseDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(game.releaseDate).getFullYear()}
                                </span>
                            )}
                            {game.developer && (
                                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {game.developer}</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                            <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                                <Star className="w-5 h-5 text-emerald-500 fill-current" />
                                <span className="text-xl font-bold text-white">{game.averageRating ? game.averageRating.toFixed(1) : 'NR'}</span>
                                <span className="text-zinc-500 text-sm">/ 5</span>
                            </div>

                            {user ? (
                                <Link
                                    href={`/games/${game._id}/review`}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Log or Review
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Login to Review
                                </Link>
                            )}

                            <button
                                onClick={() => user ? setIsListModalOpen(true) : alert("Please login to add to lists")}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-zinc-700"
                            >
                                Add to List
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                            <p className="text-zinc-300 leading-relaxed">{game.description || "No description available."}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 mb-1">Genres</h4>
                                <div className="flex flex-wrap gap-2">
                                    {game.genre && game.genre.length > 0 ? (
                                        game.genre.map(g => (
                                            <span key={g} className="bg-zinc-900 text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-800">{g}</span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-600 text-sm">N/A</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 mb-1">Platforms</h4>
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms && game.platforms.length > 0 ? (
                                        game.platforms.map(p => (
                                            <span key={p} className="bg-zinc-900 text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-800">{p}</span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-600 text-sm">N/A</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Recent Reviews</h3>
                            {reviews.length === 0 ? (
                                <div className="text-zinc-500 italic">No reviews yet. Be the first to review!</div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review._id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                                                        {review.user?.profilePicture ? (
                                                            <img src={review.user.profilePicture} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-zinc-400" />
                                                        )}
                                                    </div>
                                                    <Link href={`/users/${review.user?.username}`} className="font-medium text-white hover:text-emerald-500 transition-colors">
                                                        {review.user?.username || 'Unknown User'}
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-1 text-emerald-500">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span className="text-sm font-bold">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-zinc-300 text-sm">{review.text}</p>
                                            <p className="text-zinc-600 text-xs mt-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddToListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                gameId={gameId}
            />
        </div>
    );
}
