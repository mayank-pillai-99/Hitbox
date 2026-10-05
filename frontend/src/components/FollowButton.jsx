'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// Follow / unfollow a member. Not shown on your own profile.
// `onChange(following, followersCount)` lets the page keep its counts in sync.
export default function FollowButton({ username, initialFollowing, onChange }) {
    const { user } = useAuth();
    const toast = useToast();
    const [following, setFollowing] = useState(initialFollowing);
    const [busy, setBusy] = useState(false);

    if (user?.username === username) return null;

    const toggle = async () => {
        if (!user) {
            toast.warning('Please login to follow members');
            return;
        }

        setBusy(true);
        try {
            const url = `/users/${encodeURIComponent(username)}/follow`;
            const { data } = following ? await api.delete(url) : await api.post(url);
            setFollowing(data.following);
            onChange?.(data.following, data.followersCount);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not update follow');
        } finally {
            setBusy(false);
        }
    };

    const Icon = busy ? Loader2 : following ? UserCheck : UserPlus;

    return (
        <button
            onClick={toggle}
            disabled={busy}
            aria-pressed={following}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-60 ${
                following
                    ? 'bg-white/5 border border-white/10 text-zinc-300 hover:border-rose-500/50 hover:text-rose-400'
                    : 'bg-lime-400 text-black hover:bg-lime-300'
            }`}
        >
            <Icon className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
            {following ? 'Following' : 'Follow'}
        </button>
    );
}
