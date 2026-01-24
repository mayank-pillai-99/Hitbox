'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EditListModal from '@/components/EditListModal';
import ConfirmModal from '@/components/ConfirmModal';
import { User, Calendar, Loader2, Trash2, Edit, MessageCircle, Send, Gamepad2, Share2, Star } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Footer from '@/components/Footer';

export default function ListDetails({ params }) {
    const { user } = useAuth();
    const router = useRouter();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [listId, setListId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showDeleteListModal, setShowDeleteListModal] = useState(false);
    const [removeGameId, setRemoveGameId] = useState(null);
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const toast = useToast();

    // Unwrap params using React.use() or await if necessary in newer Next.js
    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setListId(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!listId) return;

        const fetchList = async () => {
            try {
                const res = await api.get(`/lists/${listId}`);
                setList(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch list", err);
                setError('Failed to load list details.');
                setLoading(false);
            }
        };

        fetchList();
    }, [listId]);

    // Fetch comments
    useEffect(() => {
        if (!listId) return;
        const fetchComments = async () => {
            try {
                const res = await api.get(`/comments/list/${listId}`);
                setComments(res.data);
            } catch (err) {
                console.error('Failed to fetch comments', err);
            }
        };
        fetchComments();
    }, [listId]);

    const handleUpdate = (updatedList) => {
        setList({ ...list, ...updatedList });
    };

    const handleDeleteList = async () => {
        setDeleting(true);
        try {
            await api.delete(`/lists/${listId}`);
            toast.success('List deleted successfully');
            router.push('/profile');
        } catch (err) {
            console.error("Failed to delete list", err);
            toast.error('Failed to delete list');
            setDeleting(false);
        }
    };

    const handleRemoveGame = async (gameId) => {
        try {
            const res = await api.delete(`/lists/${listId}/game/${gameId}`);
            setList(res.data);
            toast.success('Game removed from list');
        } catch (err) {
            console.error("Failed to remove game", err);
            toast.error('Failed to remove game');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p className="text-red-400 font-medium">{error || 'List not found'}</p>
                <Link href="/lists" className="text-lime-400 hover:text-lime-300 font-bold uppercase tracking-wide">Back to Lists</Link>
            </div>
        );
    }

    // Check ownership robustly
    const userId = user?.id || user?._id;
    const listUserId = list.user._id || list.user;
    const isOwner = userId && listUserId && (listUserId.toString() === userId.toString());

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* List Header */}
            <div className="relative pt-32 pb-16 w-full border-b border-white/5 bg-zinc-900/40 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1 animate-fade-in-up">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {list.games.length} Games
                                </span>
                                <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(list.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tight leading-none text-glow">
                                {list.name}
                            </h1>
                            <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl border-l-4 border-lime-400 pl-6 mb-8">
                                {list.description || "No description provided."}
                            </p>

                            <div className="flex items-center gap-3">
                                <Link href={`/users/${list.user.username}`} className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 pr-6 pl-2 py-2 rounded-full transition-all">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 group-hover:border-lime-400 overflow-hidden flex items-center justify-center transition-colors">
                                        {list.user.profilePicture ? (
                                            <img src={list.user.profilePicture} alt={list.user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-500" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Curated by</span>
                                        <span className="text-sm text-white font-bold group-hover:text-lime-400 transition-colors">{list.user.username || 'User'}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {isOwner && (
                            <div className="flex gap-3 animate-fade-in-up stagger-1">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg"
                                >
                                    <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => setShowDeleteListModal(true)}
                                    disabled={deleting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 rounded-xl text-sm font-bold text-red-500 transition-all shadow-lg"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-10">
                {/* Games List */}
                <div className="mb-20">
                    {list.games.length === 0 ? (
                        <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
                            <Gamepad2 className="w-16 h-16 mx-auto mb-6 text-zinc-700" />
                            <h3 className="text-xl font-bold text-white mb-2">This collection is empty</h3>
                            <p className="text-zinc-500 mb-6">Start adding games to bring this list to life.</p>
                            <Link href="/games" className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-colors">
                                <Gamepad2 className="w-4 h-4" /> Browse Games
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in-up stagger-1">
                            {list.games.map((game, index) => (
                                <div key={game._id} className="group relative backdrop-blur-sm bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 hover:border-lime-400/30 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-[1.01] hover:shadow-xl flex items-center gap-6">

                                    {/* Rank Number */}
                                    <div className="hidden sm:flex w-12 h-12 flex-shrink-0 items-center justify-center rounded-lg bg-black/40 border border-white/5 font-mono text-2xl font-black text-zinc-700 group-hover:text-lime-400 transition-colors">
                                        {index + 1}
                                    </div>

                                    {/* Cover */}
                                    <Link href={`/games/${game._id}`} className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden shadow-lg border border-white/5 group-hover:border-lime-400/50 transition-colors relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 py-2">
                                        <Link href={`/games/${game._id}`} className="block">
                                            <h3 className="text-xl font-black text-white group-hover:text-lime-400 transition-colors truncate mb-1">
                                                {game.title}
                                            </h3>
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 font-medium">
                                            {game.releaseDate && (
                                                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(game.releaseDate).getFullYear()}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded text-zinc-300">
                                                <Star className="w-3.5 h-3.5 text-lime-400 fill-current" />
                                                {game.averageRating ? game.averageRating.toFixed(1) : 'NR'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {isOwner && (
                                        <div className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setRemoveGameId(game._id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                                title="Remove from list"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="border-t border-white/10 pt-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-lime-400/10 rounded-xl border border-lime-400/20">
                            <MessageCircle className="w-6 h-6 text-lime-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Discussion</h2>
                            <p className="text-zinc-500 text-sm font-medium">{comments.length} Comments</p>
                        </div>
                    </div>

                    {/* Add Comment */}
                    {user ? (
                        <div className="bg-zinc-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 mb-12 shadow-xl animate-fade-in-up">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!newComment.trim()) return;
                                    setSubmittingComment(true);
                                    try {
                                        const res = await api.post(`/comments/list/${listId}`, { text: newComment });
                                        setComments([res.data, ...comments]);
                                        setNewComment('');
                                    } catch (err) {
                                        console.error('Failed to add comment', err);
                                        toast.error('Failed to add comment');
                                    } finally {
                                        setSubmittingComment(false);
                                    }
                                }}
                            >
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lime-400 font-bold">{user.username?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Share your thoughts on this collection..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 resize-none text-sm transition-all"
                                            maxLength={1000}
                                        />
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs font-bold text-zinc-600">{newComment.length}/1000</span>
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim() || submittingComment}
                                                className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-2 rounded-lg font-bold uppercase tracking-wide text-xs transition-all shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                                            >
                                                {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                {submittingComment ? 'Posting...' : 'Post Comment'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 mb-12 text-center">
                            <p className="text-zinc-400 text-sm mb-4">Join the conversation by logging in.</p>
                            <Link href="/login" className="inline-block px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-sm">
                                Login to Comment
                            </Link>
                        </div>
                    )}

                    {/* Comments Feed */}
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <div className="text-zinc-600 text-center py-8 font-medium italic">
                                Silence... be the first to break it.
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="group flex gap-4 p-6 bg-white/5 hover:bg-white/[0.07] rounded-2xl border border-white/5 transition-colors">
                                    <Link href={`/users/${comment.user?.username}`} className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {comment.user?.profilePicture ? (
                                                <img src={comment.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-zinc-500" />
                                            )}
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/users/${comment.user?.username}`} className="font-bold text-white hover:text-lime-400 transition-colors text-sm">
                                                    {comment.user?.username || 'Unknown'}
                                                </Link>
                                                <span className="text-xs font-medium text-zinc-600">•</span>
                                                <span className="text-xs font-medium text-zinc-500">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {user && comment.user?._id === user._id && (
                                                <button
                                                    onClick={() => setDeleteCommentId(comment._id)}
                                                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <EditListModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                list={list}
                onUpdate={handleUpdate}
            />

            <ConfirmModal
                isOpen={showDeleteListModal}
                onClose={() => setShowDeleteListModal(false)}
                onConfirm={handleDeleteList}
                title="Delete List"
                message="Are you sure you want to delete this list? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            <ConfirmModal
                isOpen={!!removeGameId}
                onClose={() => setRemoveGameId(null)}
                onConfirm={() => handleRemoveGame(removeGameId)}
                title="Remove Game"
                message="Are you sure you want to remove this game from the list?"
                confirmText="Remove"
                variant="warning"
            />

            <ConfirmModal
                isOpen={!!deleteCommentId}
                onClose={() => setDeleteCommentId(null)}
                onConfirm={async () => {
                    try {
                        await api.delete(`/comments/${deleteCommentId}`);
                        setComments(comments.filter(c => c._id !== deleteCommentId));
                        toast.success('Comment deleted');
                    } catch (err) {
                        console.error('Failed to delete comment', err);
                        toast.error('Failed to delete comment');
                    }
                }}
                title="Delete Comment"
                message="Are you sure you want to delete this comment?"
                confirmText="Delete"
                variant="danger"
            />

            <Footer />
        </div>
    );
}
