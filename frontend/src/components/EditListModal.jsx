'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '@/utils/api';

export default function EditListModal({ isOpen, onClose, list, onUpdate }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (list) {
            setName(list.name);
            setDescription(list.description || '');
        }
    }, [list]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/lists/${list._id}`, { name, description });
            onUpdate(res.data);
            onClose();
        } catch (err) {
            console.error("Failed to update list", err);
            alert("Failed to update list");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Edit List</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white resize-none focus:outline-none focus:border-lime-400"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
