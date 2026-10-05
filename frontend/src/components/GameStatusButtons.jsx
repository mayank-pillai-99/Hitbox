'use client';

import { useState, useEffect } from 'react';
import { Check, Play, BookmarkPlus, X, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const STATUS_OPTIONS = [
    { key: 'played', label: 'Played', icon: Check, color: 'var(--color-neon)' },
    { key: 'playing', label: 'Playing', icon: Play, color: 'var(--color-scan)' },
    { key: 'want_to_play', label: 'Want to play', icon: BookmarkPlus, color: 'var(--color-warn)' }
];

export default function GameStatusButtons({ gameId, onChange }) {
    const { user } = useAuth();
    const toast = useToast();
    const [currentStatus, setCurrentStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!user || !gameId) {
            setFetching(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const res = await api.get(`/game-status/game/${gameId}`);
                setCurrentStatus(res.data.status);
            } catch (err) {
                console.error("Failed to fetch game status", err);
            } finally {
                setFetching(false);
            }
        };

        fetchStatus();
    }, [user, gameId]);

    const handleStatusClick = async (status) => {
        if (!user) {
            toast.warning('Please login to track games');
            return;
        }

        setLoading(true);
        try {
            if (currentStatus === status) {
                // Remove status if clicking same one
                await api.delete(`/game-status/${gameId}`);
                setCurrentStatus(null);
                onChange?.();
            } else {
                // Set new status
                await api.post('/game-status', { gameId, status });
                setCurrentStatus(status);
                onChange?.();
            }
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error(err.response?.data?.message || 'Could not update your status.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null; // Don't show buttons if not logged in
    }

    if (fetching) {
        return (
            <div className="flex flex-wrap gap-2" role="status" aria-busy="true">
                <span className="sr-only">Loading your status</span>
                {[0, 1, 2].map((i) => <div key={i} className="h-11 w-28 animate-shimmer border border-line" />)}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Your status for this game">
            {STATUS_OPTIONS.map(({ key, label, icon: Icon, color }) => {
                const isActive = currentStatus === key;

                return (
                    <button
                        key={key}
                        onClick={() => handleStatusClick(key)}
                        disabled={loading}
                        aria-pressed={isActive}
                        className="flex items-center gap-2 min-h-[44px] px-4 border transition-colors disabled:opacity-50 bg-panel hover:bg-panel-2"
                        style={{
                            borderColor: isActive ? color : 'var(--color-line-strong)',
                            color: isActive ? color : 'var(--color-muted)',
                            boxShadow: isActive ? `inset 0 -3px 0 ${color}` : undefined,
                        }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Icon className="w-4 h-4" aria-hidden="true" />}
                        <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
                        {isActive && <X className="w-3 h-3 opacity-70" aria-label="Click to remove" />}
                    </button>
                );
            })}
        </div>
    );
}
