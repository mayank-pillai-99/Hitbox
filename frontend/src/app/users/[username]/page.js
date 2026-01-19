'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { User, Calendar, Star, List, Loader2, GamepadIcon } from 'lucide-react';
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
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p className="text-red-400">{error || 'User not found'}</p>
                <Link href="/" className="text-emerald-500 hover:underline">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            {/* Profile Header */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-28 h-28 rounded-full bg-zinc-800 border-4 border-emerald-500/30 overflow-hidden flex-shrink-0">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-zinc-500" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
                            {profile.bio && (
                                <p className="text-zinc-400 max-w-xl mb-4">{profile.bio}</p>
                            )}
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-zinc-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{profile.stats.reviews}</div>
                                <div className="text-sm text-zinc-500">Reviews</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{profile.stats.lists}</div>
                                <div className="text-sm text-zinc-500">Lists</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{profile.stats.gamesPlayed}</div>
                                <div className="text-sm text-zinc-500">Games</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-800">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'reviews' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Reviews ({reviews.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('lists')}
                            className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'lists' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Lists ({lists.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No reviews yet</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <Link
                                    key={review._id}
                                    href={`/games/${review.game?._id || review.game}`}
                                    className="flex gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors"
                                >
                                    {review.game?.coverImage && (
                                        <img src={review.game.coverImage} alt={review.game.title} className="w-16 h-24 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white">{review.game?.title || 'Unknown Game'}</h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                            <span className="text-emerald-500">★ {review.rating}/5</span>
                                            <span>•</span>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {review.content && (
                                            <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{review.content}</p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'lists' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lists.length === 0 ? (
                            <div className="col-span-2 text-center py-12 text-zinc-500">
                                <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No lists created yet</p>
                            </div>
                        ) : (
                            lists.map(list => (
                                <Link
                                    key={list._id}
                                    href={`/lists/${list._id}`}
                                    className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors group"
                                >
                                    {/* Preview Covers */}
                                    <div className="flex gap-1 mb-3 h-20 overflow-hidden rounded">
                                        {list.previewGames.length > 0 ? (
                                            list.previewGames.map((game, i) => (
                                                <div key={i} className="flex-1 bg-zinc-800">
                                                    <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex-1 bg-zinc-800 flex items-center justify-center">
                                                <GamepadIcon className="w-8 h-8 text-zinc-600" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white group-hover:text-emerald-500 transition-colors">{list.name}</h3>
                                    <p className="text-sm text-zinc-500">{list.gameCount} games</p>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
