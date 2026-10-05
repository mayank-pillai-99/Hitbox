'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import GameCard from './GameCard';
import SectionHeader from '@/components/ui/SectionHeader';

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
        <section className="mt-16">
            <SectionHeader tag="From reviews" title="Members who liked this also liked" as="h3" />
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {games.slice(0, 8).map((game) => (
                    <li key={game._id}>
                        <GameCard game={game} />
                        <p className="label text-neon mt-1">
                            {game.supporters} {game.supporters === 1 ? 'fan' : 'fans'} loved it
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
