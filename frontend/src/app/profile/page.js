'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Loader2, Plus, Check, Play, BookmarkPlus, Star, Pencil, Trash2, X, Heart } from 'lucide-react';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ConfirmModal from '@/components/ConfirmModal';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Profile() {
    const { user, logout } = useAuth();
    const [lists, setLists] = useState([]);
    const [gameCounts, setGameCounts] = useState({ total: 0, played: 0, playing: 0, want_to_play: 0 });
    const [gameStatuses, setGameStatuses] = useState({ played: [], playing: [], want_to_play: [] });
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit review state
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editText, setEditText] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteReviewId, setDeleteReviewId] = useState(null);
    const toast = useToast();

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [listsRes, countsRes, statusesRes, reviewsRes] = await Promise.all([
                    api.get('/lists'),
                    api.get('/game-status/counts'),
                    api.get('/game-status'),
                    api.get('/reviews/my')
                ]);
                setLists(listsRes.data);
                setGameCounts(countsRes.data);
                setGameStatuses(statusesRes.data);
                setReviews(reviewsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch profile data", err);
                setError('Failed to load profile.');
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p>Please login to view your profile.</p>
                <Link href="/login" className="text-lime-400 hover:underline">Login</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
        );
    }

    // Calculate basic stats
    const stats = {
        gamesPlayed: gameCounts.total || 0,
        reviews: user.stats?.reviews || 0,
        lists: user.stats?.lists || lists.length || 0
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-12">
            <Navbar />

            <div className="border-b border-zinc-900 pt-10 pb-10 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="animate-fade-in-up w-32 h-32 rounded-full overflow-hidden border-4 border-lime-400/30 shadow-xl bg-zinc-900 flex items-center justify-center">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.username || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-black text-lime-400">{(user.username ? user.username.charAt(0) : 'U').toUpperCase()}</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="animate-fade-in-up stagger-2 flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <h1 className="text-4xl font-black tracking-tight text-white">{user.username || 'User'}</h1>
                            <Link href="/settings" className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded text-sm text-zinc-300 transition-colors border border-zinc-800">
                                <Settings className="w-4 h-4" /> Edit Profile
                            </Link>
                        </div>
                        <p className="text-zinc-400 mb-6 max-w-md leading-relaxed">{user.bio || "No bio yet. Add one in settings!"}</p>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-10">
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-black text-white">{stats.gamesPlayed}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Games</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-black text-white">{stats.reviews}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-black text-white">{stats.lists}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Lists</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
                {/* Recent Reviews Section */}
                {reviews.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h2 className="text-2xl font-bold text-white">Recent Reviews</h2>
                            <span className="text-zinc-500">({reviews.length})</span>
                        </div>
                        <div className="space-y-4">
                            {reviews.slice(0, 5).map(review => (
                                <div
                                    key={review._id}
                                    className="flex gap-4 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800"
                                >
                                    <Link href={`/games/${review.game?._id || review.game?.igdbId}`}>
                                        {review.game?.coverImage && (
                                            <img
                                                src={review.game.coverImage}
                                                alt={review.game.title}
                                                className="w-16 h-24 object-cover rounded hover:opacity-80 transition-opacity"
                                            />
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <Link href={`/games/${review.game?._id || review.game?.igdbId}`}>
                                            <h3 className="font-bold text-white hover:text-lime-400 transition-colors">{review.game?.title || 'Unknown Game'}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                            <span className="text-lime-400">★ {review.rating}/5</span>
                                            <span>•</span>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {review.text && (
                                            <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{review.text}</p>
                                        )}
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-2">
                                            <Heart className="w-3.5 h-3.5" />
                                            <span>{review.likesCount || 0} likes</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingReview(review);
                                                setEditRating(review.rating);
                                                setEditText(review.text || '');
                                            }}
                                            className="p-2 text-zinc-400 hover:text-lime-400 hover:bg-zinc-800 rounded transition-colors"
                                            title="Edit review"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteReviewId(review._id)}
                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Edit Review Modal */}
                {editingReview && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Edit Review</h3>
                                <button onClick={() => setEditingReview(null)} className="text-zinc-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setEditRating(n)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star className={`w-8 h-8 ${editRating >= n ? 'text-lime-400 fill-lime-400' : 'text-zinc-600'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Review Text</label>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none resize-none"
                                    rows={4}
                                    placeholder="Your thoughts on the game..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setEditingReview(null)}
                                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        setSaving(true);
                                        try {
                                            await api.put(`/reviews/${editingReview._id}`, { rating: editRating, text: editText });
                                            setReviews(reviews.map(r =>
                                                r._id === editingReview._id ? { ...r, rating: editRating, text: editText } : r
                                            ));
                                            setEditingReview(null);
                                        } catch (err) {
                                            console.error('Failed to update review', err);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving || editRating === 0}
                                    className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lists Section */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
                    <h2 className="text-2xl font-bold text-white">My Lists</h2>
                    <Link href="/lists/new" className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        <Plus className="w-4 h-4" /> New List
                    </Link>
                </div>

                {lists.length > 0 ? (
                    <div className="grid gap-12">
                        {lists.map(list => (
                            <section key={list._id}>
                                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                                    <h3 className="text-xl font-bold text-white">{list.name} <span className="text-zinc-500 text-sm font-normal">({list.games.length})</span></h3>
                                    <Link href={`/lists/${list._id}`} className="text-sm text-lime-400 hover:text-lime-300">View details</Link>
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
                        <Link href="/lists/new" className="text-lime-400 hover:underline">Create your first list</Link>
                    </div>
                )}

                {/* Game Status Sections */}
                {gameStatuses.played.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
                            <Check className="w-5 h-5 text-lime-400" />
                            <h2 className="text-2xl font-bold text-white">Played</h2>
                            <span className="text-zinc-500">({gameStatuses.played.length})</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {gameStatuses.played.slice(0, 6).map(item => (
                                <GameCard key={item._id} game={item.game} />
                            ))}
                        </div>
                    </section>
                )}

                {gameStatuses.playing.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
                            <Play className="w-5 h-5 text-blue-500" />
                            <h2 className="text-2xl font-bold text-white">Playing</h2>
                            <span className="text-zinc-500">({gameStatuses.playing.length})</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {gameStatuses.playing.slice(0, 6).map(item => (
                                <GameCard key={item._id} game={item.game} />
                            ))}
                        </div>
                    </section>
                )}

                {gameStatuses.want_to_play.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
                            <BookmarkPlus className="w-5 h-5 text-amber-500" />
                            <h2 className="text-2xl font-bold text-white">Want to Play</h2>
                            <span className="text-zinc-500">({gameStatuses.want_to_play.length})</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {gameStatuses.want_to_play.slice(0, 6).map(item => (
                                <GameCard key={item._id} game={item.game} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
            <Footer />

            <ConfirmModal
                isOpen={!!deleteReviewId}
                onClose={() => setDeleteReviewId(null)}
                onConfirm={async () => {
                    try {
                        await api.delete(`/reviews/${deleteReviewId}`);
                        setReviews(reviews.filter(r => r._id !== deleteReviewId));
                        toast.success('Review deleted successfully');
                    } catch (err) {
                        console.error('Failed to delete review', err);
                        toast.error('Failed to delete review');
                    }
                }}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
