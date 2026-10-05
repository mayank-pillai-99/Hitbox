'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

// Edit your own review's rating, text and spoiler flag. Remounted per review (key), so state starts fresh.
export default function EditReviewModal({ review, onClose, onSaved }) {
    const toast = useToast();
    const [rating, setRating] = useState(review?.rating ?? 0);
    const [text, setText] = useState(review?.text ?? '');
    const [spoiler, setSpoiler] = useState(Boolean(review?.spoiler));
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/reviews/${review._id}`, { rating, text, spoiler });
            toast.success('Review updated');
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update review');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={Boolean(review)} onClose={onClose} title={`Edit review${review?.game?.title ? `: ${review.game.title}` : ''}`} size="lg">
            <form onSubmit={save} className="space-y-5">
                <fieldset>
                    <legend className="label mb-1">Rating</legend>
                    <div className="flex" role="radiogroup" aria-label="Rating from 1 to 5 stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={rating === n}
                                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                                onClick={() => setRating(n)}
                                className="w-11 h-11 flex items-center justify-center"
                            >
                                <Star className={`w-7 h-7 ${n <= rating ? 'text-neon fill-current' : 'text-line-strong'}`} aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="edit-review-text" className="label block mb-1">Review</label>
                    <textarea
                        id="edit-review-text"
                        rows={5}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={5000}
                        className="field resize-none"
                    />
                    <label className="mt-2 flex items-center gap-3 min-h-[44px] text-sm text-muted cursor-pointer select-none">
                        <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="w-5 h-5 accent-[var(--color-neon)]" />
                        Contains spoilers
                    </label>
                </div>

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                    <button type="submit" disabled={saving || rating === 0} className="btn-primary">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        Save changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}
