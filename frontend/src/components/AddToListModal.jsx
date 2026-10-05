'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Check, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

export default function AddToListModal({ isOpen, onClose, gameId }) {
    const toast = useToast();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingTo, setAddingTo] = useState(null); // id of the list being added to
    const [addedLists, setAddedLists] = useState(new Set()); // ids of lists that contain the game

    const fetchLists = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/lists');
            setLists(res.data);

            // Mark lists that already contain this game. gameId may be a local id or an IGDB id.
            const alreadyIn = new Set();
            res.data.forEach(list => {
                const hasGame = (list.games || []).some(g => g._id === gameId || String(g.igdbId) === String(gameId));
                if (hasGame) alreadyIn.add(list._id);
            });
            setAddedLists(alreadyIn);
        } catch (err) {
            console.error('Failed to fetch lists', err);
            toast.error('Could not load your lists.');
        } finally {
            setLoading(false);
        }
    }, [gameId, toast]);

    useEffect(() => {
        if (isOpen) fetchLists();
    }, [isOpen, fetchLists]);

    const addToList = async (list) => {
        setAddingTo(list._id);
        try {
            await api.post(`/lists/${list._id}/add`, { gameId });
            setAddedLists(prev => new Set(prev).add(list._id));
            toast.success(`Added to ${list.name}`);
        } catch (err) {
            if (err.response?.data?.message === 'Game already in list') {
                setAddedLists(prev => new Set(prev).add(list._id));
            } else {
                toast.error(err.response?.data?.message || 'Failed to add to list');
            }
        } finally {
            setAddingTo(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add to list">
            {loading ? (
                <div className="flex justify-center p-8" role="status">
                    <Loader2 className="w-8 h-8 animate-spin text-neon" aria-hidden="true" />
                    <span className="sr-only">Loading your lists</span>
                </div>
            ) : lists.length > 0 ? (
                <ul className="space-y-2">
                    {lists.map(list => {
                        const isAdded = addedLists.has(list._id);
                        const isAdding = addingTo === list._id;

                        return (
                            <li key={list._id}>
                                <button
                                    onClick={() => !isAdded && addToList(list)}
                                    disabled={isAdded || isAdding}
                                    aria-label={isAdded ? `${list.name}: game already added` : `Add to ${list.name}`}
                                    className={`w-full min-h-[44px] flex items-center justify-between gap-3 p-3 border text-left transition-colors ${isAdded
                                        ? 'border-neon bg-panel-2 cursor-default'
                                        : 'border-line-strong hover:border-neon'}`}
                                >
                                    <span className="min-w-0">
                                        <span className="block font-bold text-fg truncate">{list.name}</span>
                                        <span className="label">{list.games.length} games</span>
                                    </span>
                                    {isAdding ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-neon" aria-hidden="true" />
                                    ) : isAdded ? (
                                        <Check className="w-5 h-5 text-neon" aria-hidden="true" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-muted" aria-hidden="true" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center py-6 text-muted">
                    <p>You don&apos;t have any lists yet.</p>
                    <Link href="/lists/new" className="btn-primary mt-4">Create a list</Link>
                </div>
            )}
        </Modal>
    );
}
