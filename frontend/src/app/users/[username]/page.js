'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { User, Calendar, Star, List, Loader2, Gamepad2, ArrowRight } from 'lucide-react';
import api from '@/utils/api';

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
                <p className="text-zinc-400">{error || 'User not found'}</p>
                <Link href="/members" className="text-lime-400 hover:underline flex items-center gap-1">
                    Browse Members <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />

            {/* Profile Header */}
            <div className="border-b border-zinc-900">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-zinc-900 border-4 border-lime-400/30 overflow-hidden">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                        <span className="text-4xl font-black text-lime-400">
                                            {profile.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2">{profile.username}</h1>
                            {profile.bio && (
                                <p className="text-zinc-400 max-w-xl mb-4 leading-relaxed">{profile.bio}</p>
                            )}
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">{profile.stats.reviews}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">{profile.stats.lists}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Lists</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">{profile.stats.gamesPlayed || 0}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Games</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-900 sticky top-0 bg-black z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`py-4 px-6 font-bold text-sm uppercase tracking-wide transition-colors relative ${activeTab === 'reviews'
                                    ? 'text-lime-400'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Reviews
                            <span className="ml-2 text-zinc-600">{reviews.length}</span>
                            {activeTab === 'reviews' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('lists')}
                            className={`py-4 px-6 font-bold text-sm uppercase tracking-wide transition-colors relative ${activeTab === 'lists'
                                    ? 'text-lime-400'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Lists
                            <span className="ml-2 text-zinc-600">{lists.length}</span>
                            {activeTab === 'lists' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16">
                                <Star className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
                                <p className="text-zinc-500 text-lg">No reviews yet</p>
                                <p className="text-zinc-600 text-sm mt-1">When {profile.username} reviews games, they'll appear here.</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <Link
                                    key={review._id}
                                    href={`/games/${review.game?._id || review.game}`}
                                    className="flex gap-4 bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all group"
                                >
                                    <div className="w-16 h-24 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                        {review.game?.coverImage ? (
                                            <img src={review.game.coverImage} alt={review.game.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Gamepad2 className="w-6 h-6 text-zinc-700" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-bold text-white group-hover:text-lime-400 transition-colors truncate">
                                                {review.game?.title || 'Unknown Game'}
                                            </h3>
                                            <div className="flex gap-0.5 flex-shrink-0">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-lime-400 fill-lime-400' : 'text-zinc-700'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-sm text-zinc-500 mt-1">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        {(review.text || review.content) && (
                                            <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{review.text || review.content}</p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'lists' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {lists.length === 0 ? (
                            <div className="col-span-2 text-center py-16">
                                <List className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
                                <p className="text-zinc-500 text-lg">No lists created yet</p>
                                <p className="text-zinc-600 text-sm mt-1">When {profile.username} creates lists, they'll appear here.</p>
                            </div>
                        ) : (
                            lists.map(list => (
                                <Link
                                    key={list._id}
                                    href={`/lists/${list._id}`}
                                    className="bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all group overflow-hidden"
                                >
                                    {/* Preview Covers */}
                                    <div className="flex h-24">
                                        {list.previewGames && list.previewGames.length > 0 ? (
                                            list.previewGames.slice(0, 4).map((game, i) => (
                                                <div key={i} className="flex-1 bg-zinc-800">
                                                    {game.coverImage && (
                                                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex-1 bg-zinc-800 flex items-center justify-center">
                                                <Gamepad2 className="w-8 h-8 text-zinc-700" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-white group-hover:text-lime-400 transition-colors">{list.name}</h3>
                                        <p className="text-sm text-zinc-500 mt-1">{list.gameCount} games</p>
                                        {list.description && (
                                            <p className="text-zinc-500 text-sm mt-2 line-clamp-1">{list.description}</p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
