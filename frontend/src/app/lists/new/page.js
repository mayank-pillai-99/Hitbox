'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { X, Loader2 } from 'lucide-react';
import api from '@/utils/api';

export default function ListEditor() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            await api.post('/lists', {
                name,
                description
            });
            router.push('/profile');
        } catch (err) {
            console.error("Failed to create list", err);
            alert("Failed to create list. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">Create New List</h1>
                        <Link href="/profile" className="text-zinc-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-8">
                        {/* List Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                                List Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                placeholder="e.g., Top 10 RPGs of All Time"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                                Description <span className="text-zinc-500 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors resize-none"
                                placeholder="What is this list about?"
                            ></textarea>
                        </div>

                        {/* Note: Game addition is handled in List Details view for simplicity in this MVP */}
                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-400">
                            Games can be added to this list from individual game pages or the list details page after creation.
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800">
                            <Link href="/profile" className="px-6 py-2 text-zinc-400 hover:text-white font-medium transition-colors">
                                Cancel
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !name.trim()}
                                className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
