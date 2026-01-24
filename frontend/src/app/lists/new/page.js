'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { X, Loader2, List, Sparkles } from 'lucide-react';
import api from '@/utils/api';
import Footer from '@/components/Footer';

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
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-lime-900/20 via-black to-black" />
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-lime-500/10 rounded-full blur-[120px]" />
            </div>

            <main className="flex-grow flex items-center justify-center p-4 relative z-10 my-12">
                <div className="max-w-xl w-full">
                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                            <List className="w-3 h-3" /> New Collection
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none text-glow mb-2">
                            Create a List
                        </h1>
                        <p className="text-zinc-500 text-lg">Curate your favorite games into a custom collection.</p>
                    </div>

                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Header */}
                        <div className="border-b border-white/5 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-lime-400" />
                                <h2 className="text-lg font-bold text-white">List Details</h2>
                            </div>
                            <Link href="/profile" className="text-zinc-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Form */}
                        <div className="p-8 space-y-6">
                            {/* List Name */}
                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    List Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all font-medium text-lg shadow-inner"
                                    placeholder="e.g., Top 10 RPGs, Weekend Vibes..."
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Description <span className="text-zinc-600 font-normal normal-case opacity-60">(Optional)</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all resize-none shadow-inner leading-relaxed"
                                    placeholder="What makes this collection special?"
                                ></textarea>
                            </div>

                            {/* Info Box */}
                            <div className="bg-lime-500/5 p-4 rounded-xl border border-lime-500/10 text-sm text-lime-200/60 leading-relaxed flex gap-3">
                                <div className="mt-0.5 min-w-[20px]">💡</div>
                                <p>You can add games to this list directly from any game page or the list details page after you create it.</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href="/profile" className="px-6 py-3 text-zinc-400 hover:text-white font-bold text-sm uppercase tracking-wide transition-colors">
                                    Cancel
                                </Link>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !name.trim()}
                                    className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-wide text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transform hover:-translate-y-0.5"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create List'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
