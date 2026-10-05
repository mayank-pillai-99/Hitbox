'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import GameCard from './GameCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { GameGridSkeleton } from '@/components/ui/Skeleton';

// Personalised picks, each with the reason it was suggested. Hidden if the request fails.
export default function RecommendedForYou() {
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        api.get('/recommendations', { params: { limit: 12 } })
            .then((res) => setData(res.data))
            .catch((err) => {
                console.error('Failed to load recommendations', err);
                setFailed(true);
            });
    }, []);

    if (failed || (data && data.items.length === 0)) return null;

    const personalized = !data || data.personalized;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-line">
            <SectionHeader
                index="02"
                tag="For you"
                title={personalized ? 'Recommended for you' : 'Popular with members'}
            />
            {data && !data.personalized && (
                <p className="-mt-3 mb-6 text-sm text-muted">Rate a few games and these picks will be tuned to your taste.</p>
            )}

            {!data ? (
                <GameGridSkeleton count={6} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" />
            ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {data.items.map(({ game, reasons }) => (
                        <li key={game._id}>
                            <GameCard game={game} />
                            <p className="mt-1 text-xs text-scan leading-snug line-clamp-2" title={reasons.join('. ')}>
                                {reasons[0]}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
