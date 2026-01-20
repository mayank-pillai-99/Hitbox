'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import api from '@/utils/api';

export default function AddToListModal({ isOpen, onClose, gameId }) {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingTo, setAddingTo] = useState(null); // ID of list currently being added to
    const [addedLists, setAddedLists] = useState(new Set()); // Set of IDs of lists where game is added

    useEffect(() => {
        if (isOpen) {
            fetchLists();
        }
    }, [isOpen]);

    const fetchLists = async () => {
        try {
            setLoading(true);
            const res = await api.get('/lists');
            setLists(res.data);

            // Check which lists already contain this game
            // Optimally, we'd check against the game's ID (local vs RAWG)
            // But since the frontend might only know RAWG ID or Local ID depending on page context,
            // and the list contains Objects or IDs...
            // Let's rely on a simpler check if possible, or just let the user try and catch the "Already in list" error.
            // For a better UX, we'll try to check:
            const alreadyIn = new Set();
            res.data.forEach(list => {
                const games = list.games || [];
                // Check if any game in the list matches our gameId (either _id or rawgId if we had it populated)
                // Since lists populate games, list.games is an array of Game objects.
                // We need to match game._id OR game.rawgId with our current gameId props.
                const hasGame = games.some(g => g._id === gameId || String(g.rawgId) === String(gameId));
                if (hasGame) {
                    alreadyIn.add(list._id);
                }
            });
            setAddedLists(alreadyIn);

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch lists", err);
            setLoading(false);
        }
    };

    const addToList = async (listId) => {
        setAddingTo(listId);
        try {
            await api.post(`/lists/${listId}/add`, { gameId });
            setAddedLists(prev => new Set(prev).add(listId));
            // Optional: Show toast
        } catch (err) {
            console.error("Failed to add to list", err);
            if (err.response?.data?.message === 'Game already in list') {
                setAddedLists(prev => new Set(prev).add(listId));
            } else {
                alert("Failed to add to list");
            }
        } finally {
            setAddingTo(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Add to List</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
                        </div>
                    ) : lists.length > 0 ? (
                        <div className="space-y-2">
                            {lists.map(list => {
                                const isAdded = addedLists.has(list._id);
                                const isAdding = addingTo === list._id;

                                return (
                                    <button
                                        key={list._id}
                                        onClick={() => !isAdded && addToList(list._id)}
                                        disabled={isAdded || isAdding}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isAdded
                                                ? 'bg-emerald-900/20 border-emerald-900/50 cursor-default'
                                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <div className="font-medium text-white">{list.name}</div>
                                            <div className="text-xs text-zinc-500">{list.games.length} games</div>
                                        </div>

                                        {isAdding ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-lime-400" />
                                        ) : isAdded ? (
                                            <Check className="w-5 h-5 text-lime-400" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500">
                            <p>You don't have any lists yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
