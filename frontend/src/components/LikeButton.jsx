'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// Like / unlike a review. Updates immediately and rolls back if the request fails.
export default function LikeButton({ review }) {
    const { user } = useAuth();
    const toast = useToast();
    const initiallyLiked = Boolean(user && review.likes?.includes(user._id));
    const [liked, setLiked] = useState(initiallyLiked);
    const [count, setCount] = useState(review.likesCount || 0);
    const [busy, setBusy] = useState(false);

    const toggle = async () => {
        if (!user) {
            toast.warning('Please log in to like reviews');
            return;
        }
        if (busy) return;

        const wasLiked = liked;
        setBusy(true);
        setLiked(!wasLiked);
        setCount((c) => c + (wasLiked ? -1 : 1));
        try {
            const { data } = wasLiked
                ? await api.delete(`/reviews/${review._id}/like`)
                : await api.post(`/reviews/${review._id}/like`);
            setCount(data.likesCount);
        } catch (err) {
            setLiked(wasLiked);
            setCount((c) => c + (wasLiked ? 1 : -1));
            toast.error(err.response?.data?.message || 'Could not update your like');
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={toggle}
            aria-pressed={liked}
            aria-label={`${liked ? 'Unlike' : 'Like'} this review, ${count} ${count === 1 ? 'like' : 'likes'}`}
            className={`flex items-center gap-2 min-h-[44px] px-3 label hover:text-hot ${liked ? '!text-hot' : ''}`}
        >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
            <span aria-hidden="true">{count}</span>
        </button>
    );
}
