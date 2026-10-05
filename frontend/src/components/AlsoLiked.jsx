'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import GameCard from './GameCard';

// Games loved by the members who loved this one. Renders nothing until there is something to show.
export default function AlsoLiked({ gameId }) {
    const [games, setGames] = useState([]);

    useEffect(() => {
        let cancelled = false;
        api.get(`/games/${gameId}/also-liked`)
            .then((res) => { if (!cancelled) setGames(res.data); })
            .catch((err) => console.error('Failed to load also-liked games', err));
        return () => { cancelled = true; };
    }, [gameId]);

    if (games.length === 0) return null;

    return (
        <div className="mt-16">
            <h3 className="text-2xl font-black text-white mb-1">Members who liked this also liked</h3>
            <p className="text-sm text-zinc-500 mb-6">From reviews on Hitbox</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {games.slice(0, 8).map((game) => (
                    <div key={game._id}>
                        <GameCard game={game} />
                        <p className="mt-1 text-xs text-lime-400/80">
                            {game.supporters} {game.supporters === 1 ? 'fan' : 'fans'} loved it
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
