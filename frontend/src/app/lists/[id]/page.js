'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EditListModal from '@/components/EditListModal';
import { User, Calendar, MoreHorizontal, Loader2, Trash2, Edit, MessageCircle, Send } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

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
        if (!confirm("Are you sure you want to delete this list? This action cannot be undone.")) return;
        setDeleting(true);
        try {
            await api.delete(`/lists/${listId}`);
            router.push('/profile');
        } catch (err) {
            console.error("Failed to delete list", err);
            alert("Failed to delete list.");
            setDeleting(false);
        }
    };

    const handleRemoveGame = async (gameId) => {
        if (!confirm("Remove this game from the list?")) return;
        try {
            const res = await api.delete(`/lists/${listId}/game/${gameId}`);
            setList(res.data);
        } catch (err) {
            console.error("Failed to remove game", err);
            alert("Failed to remove game from list.");
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
                <p className="text-red-400">{error || 'List not found'}</p>
                <Link href="/profile" className="text-lime-400 hover:underline">Back to Profile</Link>
            </div>
        );
    }

    // Check ownership robustly
    const userId = user?.id || user?._id;
    const listUserId = list.user._id || list.user;

    const isOwner = userId && listUserId && (listUserId.toString() === userId.toString());

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-12">
            <Navbar />

            <div className="bg-zinc-900 border-b border-zinc-800 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{list.name}</h1>
                            <p className="text-zinc-400 text-lg mb-6 leading-relaxed max-w-2xl">{list.description}</p>

                            <div className="flex items-center gap-6 text-sm text-zinc-500">
                                <div className="flex items-center gap-2">
                                    {list.user.profilePicture ? (
                                        <img src={list.user.profilePicture} alt={list.user.username} className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <User className="w-6 h-6 p-1 bg-zinc-800 rounded-full" />
                                    )}
                                    <span className="text-zinc-300">Created by </span>
                                    <Link href={`/users/${list.user.username}`} className="text-zinc-300 font-medium hover:text-lime-400 transition-colors">
                                        {list.user.username || 'User'}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-white font-bold">{list.games.length}</span> games
                                </div>
                            </div>
                        </div>

                        {isOwner && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" /> Edit List
                                </button>
                                <button
                                    onClick={handleDeleteList}
                                    disabled={deleting}
                                    className="p-2 bg-zinc-800 hover:bg-red-900/20 border border-zinc-700 hover:border-red-900/50 rounded-lg transition-colors text-zinc-400 hover:text-red-500"
                                    title="Delete List"
                                >
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {list.games.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                        <p className="text-zinc-500">No games added to this list yet.</p>
                        <p className="text-zinc-600 text-sm mt-2">Go to a game page to add it to this list.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {list.games.map((game, index) => (
                            <div key={game._id} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors group">
                                <div className="flex-shrink-0 w-8 text-center font-mono text-zinc-500 text-lg">
                                    {index + 1}
                                </div>

                                <Link href={`/games/${game._id}`} className="flex-shrink-0 w-16 h-24 rounded overflow-hidden shadow-lg">
                                    <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link href={`/games/${game._id}`} className="text-lg font-bold text-white hover:text-lime-400 transition-colors truncate block">
                                        {game.title}
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                        {game.releaseDate && <span>{new Date(game.releaseDate).getFullYear()}</span>}
                                        <span>•</span>
                                        <span className="text-lime-400 font-medium">★ {game.averageRating ? game.averageRating.toFixed(1) : 'NR'}</span>
                                    </div>
                                </div>

                                {isOwner && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4">
                                        <button
                                            onClick={() => handleRemoveGame(game._id)}
                                            className="text-zinc-500 hover:text-red-400 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" /> Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comments Section */}
            <div className="max-w-5xl mx-auto px-4 py-8 border-t border-zinc-800">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-lime-400" />
                    Discussion ({comments.length})
                </h2>

                {/* Add Comment Form */}
                {user ? (
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
                                alert('Failed to add comment');
                            } finally {
                                setSubmittingComment(false);
                            }
                        }}
                        className="mb-6"
                    >
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                    placeholder="Add to the discussion..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 resize-none text-sm"
                                    maxLength={1000}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-zinc-500">{newComment.length}/1000</span>
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || submittingComment}
                                        className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-2 rounded font-medium text-sm transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submittingComment ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 text-center">
                        <p className="text-zinc-400 text-sm">Please <Link href="/login" className="text-lime-400 hover:underline">log in</Link> to join the discussion.</p>
                    </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">No comments yet. Be the first to start a discussion!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="flex gap-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <Link href={`/users/${comment.user?.username}`} className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                                        {comment.user?.profilePicture ? (
                                            <img src={comment.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-500" />
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <Link href={`/users/${comment.user?.username}`} className="font-medium text-white hover:text-lime-400 transition-colors text-sm">
                                            {comment.user?.username || 'Unknown'}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                            {user && comment.user?._id === user._id && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Delete this comment?')) return;
                                                        try {
                                                            await api.delete(`/comments/${comment._id}`);
                                                            setComments(comments.filter(c => c._id !== comment._id));
                                                        } catch (err) {
                                                            console.error('Failed to delete comment', err);
                                                        }
                                                    }}
                                                    className="text-zinc-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <EditListModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                list={list}
                onUpdate={handleUpdate}
            />
        </div>
    );
}
