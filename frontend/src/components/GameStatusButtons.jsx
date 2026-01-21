'use client';

import { useState, useEffect } from 'react';
import { Check, Play, BookmarkPlus, X, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const STATUS_OPTIONS = [
    { key: 'played', label: 'Played', icon: Check, color: 'emerald' },
    { key: 'playing', label: 'Playing', icon: Play, color: 'blue' },
    { key: 'want_to_play', label: 'Want to Play', icon: BookmarkPlus, color: 'amber' }
];

export default function GameStatusButtons({ gameId }) {
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
            } else {
                // Set new status
                await api.post('/game-status', { gameId, status });
                setCurrentStatus(status);
            }
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null; // Don't show buttons if not logged in
    }

    if (fetching) {
        return (
            <div className="flex gap-2">
                <div className="h-10 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-10 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(({ key, label, icon: Icon, color }) => {
                const isActive = currentStatus === key;
                const colorClasses = {
                    emerald: isActive
                        ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-lime-400/50 hover:text-lime-300',
                    blue: isActive
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400',
                    amber: isActive
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400'
                };

                return (
                    <button
                        key={key}
                        onClick={() => handleStatusClick(key)}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${colorClasses[color]} disabled:opacity-50`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Icon className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{label}</span>
                        {isActive && <X className="w-3 h-3 ml-1 opacity-60" />}
                    </button>
                );
            })}
        </div>
    );
}
