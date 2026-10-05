'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Loader2 } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import GameCover from '@/components/ui/GameCover';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import api from '@/utils/api';
import useApi from '@/hooks/useApi';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useToast } from '@/context/ToastContext';

const RATING_WORDS = ['', 'Poor', 'Weak', 'Decent', 'Great', 'Masterpiece'];

export default function ReviewEditor({ params }) {
    const { id } = use(params);
    const { ready } = useRequireAuth();
    const toast = useToast();
    const router = useRouter();

    const gameReq = useApi(`/games/${id}`, undefined, { enabled: ready });
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [spoiler, setSpoiler] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!ready || gameReq.loading) return <PageShell><ProfileSkeleton /></PageShell>;
    if (gameReq.error) return <PageShell><ErrorState message="Could not load this game." onRetry={gameReq.reload} /></PageShell>;

    const game = gameReq.data;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.warning('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/reviews', { gameId: id, rating, text, spoiler });
            toast.success('Review posted');
            router.push(`/games/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post review');
            setSubmitting(false);
        }
    };

    return (
        <PageShell>
            <div className="max-w-2xl mx-auto animate-fade-in-up">
                <p className="label text-neon">Review</p>
                <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 aspect-[3/4] shrink-0 border border-line">
                        <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                    </div>
                    <h1 className="display text-3xl sm:text-4xl break-words">{game.title}</h1>
                </div>

                <form onSubmit={handleSubmit} className="panel brackets p-6 mt-8 space-y-6">
                    <fieldset>
                        <legend className="label mb-2">Your rating</legend>
                        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating from 1 to 5 stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    role="radio"
                                    aria-checked={rating === star}
                                    aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                                    onClick={() => setRating(star)}
                                    className="w-11 h-11 flex items-center justify-center group"
                                >
                                    <Star className={`w-8 h-8 transition-colors ${star <= rating ? 'text-neon fill-current' : 'text-line-strong group-hover:text-muted'}`} aria-hidden="true" />
                                </button>
                            ))}
                            <span className="ml-3 label text-fg" aria-live="polite">{rating > 0 ? `${rating}/5 ${RATING_WORDS[rating]}` : 'Select a rating'}</span>
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor="review" className="label block mb-1">Your review (optional)</label>
                        <textarea
                            id="review"
                            rows={6}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={5000}
                            className="field resize-none"
                            placeholder="Write your thoughts on the game"
                        />
                        <label className="mt-3 flex items-center gap-3 min-h-[44px] text-sm text-muted cursor-pointer select-none">
                            <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="w-5 h-5 accent-[var(--color-neon)]" />
                            This review contains spoilers
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={`/games/${id}`} className="btn-ghost">Cancel</Link>
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                            Post review
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>
    );
}
