'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Loader2, Plus, Check, Play, BookmarkPlus, Star, Pencil, Trash2, X, Heart, Gamepad2, List, Calendar } from 'lucide-react';
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
                <p className="text-xl font-bold">Please login to view your profile.</p>
                <Link href="/login" className="px-6 py-2 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-lg uppercase tracking-wide transition-colors">Login</Link>
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
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            {/* Cinematic Header Background (Consistent with Public Profile) */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10" />

                {/* Simulated dynamic background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-50" />

                {/* Optional: Use a game image from 'playing' or 'played' as banner */}
                {gameStatuses.playing.length > 0 && gameStatuses.playing[0].game.coverImage && (
                    <img
                        src={gameStatuses.playing[0].game.coverImage}
                        className="w-full h-full object-cover opacity-20 blur-xl scale-110"
                        alt=""
                    />
                )}
            </div>

            <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 -mt-32">
                <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-zinc-800 to-zinc-700 group-hover:from-lime-400 group-hover:to-lime-200 transition-colors duration-500 shadow-2xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black border-4 border-black relative">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <span className="text-5xl font-black text-zinc-700 group-hover:text-lime-400 transition-colors">
                                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none text-glow">
                                {user.username || 'User'}
                            </h1>
                            <Link href="/settings" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-all">
                                <Settings className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-medium mb-4">
                            <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5" />
                                Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                            </span>
                            {user.bio ? (
                                <span className="border-l border-zinc-700 pl-4 italic text-zinc-500 max-w-lg truncate">
                                    "{user.bio}"
                                </span>
                            ) : (
                                <Link href="/settings" className="border-l border-zinc-700 pl-4 text-zinc-600 hover:text-lime-400 text-sm transition-colors">
                                    + Add a bio
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 pb-4">
                        <div className="bg-zinc-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center min-w-[100px] shadow-lg">
                            <div className="text-3xl font-black text-white leading-none mb-1">{stats.gamesPlayed}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Games</div>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center min-w-[100px] shadow-lg">
                            <div className="text-3xl font-black text-white leading-none mb-1">{stats.reviews}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reviews</div>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center min-w-[100px] shadow-lg">
                            <div className="text-3xl font-black text-white leading-none mb-1">{stats.lists}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lists</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-16 pb-20">
                    {/* Game Status Libraries */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Playing */}
                        <div className="bg-zinc-900/30 backdrop-blur rounded-2xl border border-white/5 p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Playing</h2>
                                <span className="ml-auto text-xs font-bold bg-white/5 px-2 py-1 rounded text-zinc-400">{gameStatuses.playing.length}</span>
                            </div>
                            {gameStatuses.playing.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {gameStatuses.playing.slice(0, 6).map(item => (
                                        <Link href={`/games/${item.game._id}`} key={item._id} className="block group relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 hover:border-blue-500/50 transition-colors">
                                            <img src={item.game.coverImage} alt={item.game.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-xl">
                                    <Gamepad2 className="w-8 h-8 text-zinc-700 mb-2" />
                                    <p className="text-zinc-500 text-sm">Not playing anything?</p>
                                </div>
                            )}
                        </div>

                        {/* Want to Play */}
                        <div className="bg-zinc-900/30 backdrop-blur rounded-2xl border border-white/5 p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <BookmarkPlus className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Want to Play</h2>
                                <span className="ml-auto text-xs font-bold bg-white/5 px-2 py-1 rounded text-zinc-400">{gameStatuses.want_to_play.length}</span>
                            </div>
                            {gameStatuses.want_to_play.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {gameStatuses.want_to_play.slice(0, 6).map(item => (
                                        <Link href={`/games/${item.game._id}`} key={item._id} className="block group relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 hover:border-amber-500/50 transition-colors">
                                            <img src={item.game.coverImage} alt={item.game.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-xl">
                                    <BookmarkPlus className="w-8 h-8 text-zinc-700 mb-2" />
                                    <p className="text-zinc-500 text-sm">Your backlog is empty.</p>
                                </div>
                            )}
                        </div>

                        {/* Played Recently (or just Played) */}
                        <div className="bg-zinc-900/30 backdrop-blur rounded-2xl border border-white/5 p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-lime-400/10 rounded-lg text-lime-400">
                                    <Check className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Played</h2>
                                <span className="ml-auto text-xs font-bold bg-white/5 px-2 py-1 rounded text-zinc-400">{gameStatuses.played.length}</span>
                            </div>
                            {gameStatuses.played.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {gameStatuses.played.slice(0, 6).map(item => (
                                        <Link href={`/games/${item.game._id}`} key={item._id} className="block group relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 hover:border-lime-400/50 transition-colors">
                                            <img src={item.game.coverImage} alt={item.game.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-xl">
                                    <Check className="w-8 h-8 text-zinc-700 mb-2" />
                                    <p className="text-zinc-500 text-sm">No games finished yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Lists Section */}
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <List className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">My Lists</h2>
                            </div>
                            <Link href="/lists/new" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors text-white">
                                <Plus className="w-4 h-4" /> Create List
                            </Link>
                        </div>

                        {lists.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lists.map(list => (
                                    <Link
                                        key={list._id}
                                        href={`/lists/${list._id}`}
                                        className="group bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-purple-500/50 hover:bg-zinc-900/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1 block h-full"
                                    >
                                        <div className="flex h-32 border-b border-white/5 relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent z-10" />
                                            {list.games && list.games.length > 0 ? (
                                                list.games.slice(0, 3).map((game, i) => (
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
                                                <span className="bg-purple-500/10 text-purple-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-purple-500/20">
                                                    {list.games.length} Games
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors mb-1 truncate">{list.name}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                <List className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                                <p className="text-zinc-500">Create lists to organize your games.</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Reviews */}
                    {reviews.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Recent Reviews</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reviews.map(review => (
                                    <div
                                        key={review._id}
                                        className="flex gap-4 p-5 bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-colors group"
                                    >
                                        <Link href={`/games/${review.game?._id || review.game?.igdbId}`} className="flex-shrink-0">
                                            {review.game?.coverImage ? (
                                                <img
                                                    src={review.game.coverImage}
                                                    alt={review.game.title}
                                                    className="w-16 h-24 object-cover rounded-lg shadow-lg border border-white/5 group-hover:border-lime-400/50 transition-colors"
                                                />
                                            ) : (
                                                <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center">
                                                    <Gamepad2 className="w-6 h-6 text-zinc-700" />
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <Link href={`/games/${review.game?._id || review.game?.igdbId}`}>
                                                    <h3 className="font-bold text-white hover:text-lime-400 transition-colors truncate">{review.game?.title || 'Unknown Game'}</h3>
                                                </Link>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingReview(review);
                                                            setEditRating(review.rating);
                                                            setEditText(review.text || '');
                                                        }}
                                                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteReviewId(review._id)}
                                                        className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-lime-400 fill-lime-400' : 'text-zinc-800'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-zinc-600 font-bold">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {review.text && (
                                                <p className="text-zinc-400 text-sm line-clamp-2">{review.text}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
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
            {/* Edit Review Modal (Simplified inline for now) */}
            {editingReview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-zinc-900 rounded-2xl border border-white/10 max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Edit Review</h3>
                            <button onClick={() => setEditingReview(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Rating</label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setEditRating(n)}
                                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star className={`w-8 h-8 ${editRating >= n ? 'text-lime-400 fill-lime-400' : 'text-zinc-800'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Review</label>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:border-lime-400 focus:outline-none resize-none text-sm leading-relaxed"
                                rows={4}
                                placeholder="Write your review..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setEditingReview(null)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition-colors"
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
                                        toast.success('Review updated');
                                    } catch (err) {
                                        console.error('Failed to update review', err);
                                        toast.error('Failed to update review');
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                disabled={saving || editRating === 0}
                                className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black rounded-xl font-bold uppercase tracking-wide text-sm transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
