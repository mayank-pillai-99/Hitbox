'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Star, X, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function ReviewEditor({ params }) {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [gameId, setGameId] = useState(null);
    const [gameTitle, setGameTitle] = useState('');
    const [gameCover, setGameCover] = useState('');
    const router = useRouter();
    const { user } = useAuth();

    // Unwrap params and fetch game info for context
    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params;
            setGameId(resolvedParams.id);

            try {
                const res = await api.get(`/games/${resolvedParams.id}`);
                setGameTitle(res.data.title);
                setGameCover(res.data.coverImage);
            } catch (err) {
                console.error("Failed to load game info");
            }
        };
        init();
    }, [params]);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/reviews', {
                gameId,
                rating,
                text
            });
            router.push(`/games/${gameId}`);
        } catch (err) {
            console.error("Failed to post review", err);
            alert(err.response?.data?.message || "Failed to post review");
            setSubmitting(false);
        }
    };

    if (!gameId) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-zinc-800 p-6 flex items-start justify-between">
                        <div className="flex gap-4">
                            {gameCover && (
                                <img src={gameCover} alt={gameTitle} className="w-16 h-24 object-cover rounded shadow-md" />
                            )}
                            <div>
                                <h2 className="text-sm text-zinc-400 uppercase tracking-wider font-semibold">Reviewing</h2>
                                <h1 className="text-2xl font-bold text-white">{gameTitle || 'Loading...'}</h1>
                            </div>
                        </div>
                        <Link href={`/games/${gameId}`} className="text-zinc-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-8">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-3">Rating</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="group focus:outline-none"
                                    >
                                        <Star className={`w-8 h-8 ${star <= rating ? 'text-lime-400 fill-current' : 'text-zinc-700 group-hover:text-zinc-600'} transition-colors`} />
                                    </button>
                                ))}
                                <span className="ml-4 text-xl font-bold text-white">{rating > 0 ? rating.toFixed(1) : '-'}</span>
                            </div>
                        </div>

                        {/* Review Text */}
                        <div>
                            <label htmlFor="review" className="block text-sm font-medium text-zinc-300 mb-2">
                                Your Review
                            </label>
                            <textarea
                                id="review"
                                rows={6}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors resize-none"
                                placeholder="Write your thoughts on the game..."
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link href={`/games/${gameId}`} className="px-6 py-2 text-zinc-400 hover:text-white font-medium transition-colors">
                                Cancel
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Post Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
