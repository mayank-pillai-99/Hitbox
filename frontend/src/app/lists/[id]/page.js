'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EditListModal from '@/components/EditListModal';
import { User, Calendar, MoreHorizontal, Loader2, Trash2, Edit } from 'lucide-react';
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
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center flex-col gap-4">
                <p className="text-red-400">{error || 'List not found'}</p>
                <Link href="/profile" className="text-emerald-500 hover:underline">Back to Profile</Link>
            </div>
        );
    }

    // Check ownership robustly
    const userId = user?.id || user?._id;
    const listUserId = list.user._id || list.user;

    const isOwner = userId && listUserId && (listUserId.toString() === userId.toString());

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
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
                                    <Link href={`/users/${list.user.username}`} className="text-zinc-300 font-medium hover:text-emerald-500 transition-colors">
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
                                    <Link href={`/games/${game._id}`} className="text-lg font-bold text-white hover:text-emerald-500 transition-colors truncate block">
                                        {game.title}
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                        {game.releaseDate && <span>{new Date(game.releaseDate).getFullYear()}</span>}
                                        <span>•</span>
                                        <span className="text-emerald-500 font-medium">★ {game.averageRating ? game.averageRating.toFixed(1) : 'NR'}</span>
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

            <EditListModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                list={list}
                onUpdate={handleUpdate}
            />
        </div>
    );
}
