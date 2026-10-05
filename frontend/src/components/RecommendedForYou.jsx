'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import GameCard from './GameCard';

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

    return (
        <section className="pt-10 pb-20 px-6 lg:px-12 border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-lime-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-4 h-4" /> For you
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">
                        {data && !data.personalized ? 'POPULAR WITH MEMBERS' : 'RECOMMENDED FOR YOU'}
                    </h2>
                    {data && !data.personalized && (
                        <p className="mt-2 text-sm text-zinc-500">
                            Rate a few games and these picks will be tuned to your taste.
                        </p>
                    )}
                </div>

                {!data ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                        {data.items.map(({ game, reasons }) => (
                            <div key={game._id}>
                                <GameCard game={game} />
                                <p className="mt-1 text-xs text-lime-400/80 leading-snug line-clamp-2" title={reasons.join('. ')}>
                                    {reasons[0]}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
