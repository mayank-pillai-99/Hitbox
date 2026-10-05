import { Star } from 'lucide-react';

const STATUS_LABELS = [
    { key: 'played', label: 'Played' },
    { key: 'playing', label: 'Playing' },
    { key: 'want_to_play', label: 'Want to play' },
];

// Rating distribution (5 stars at the top) and how many members track the game.
export default function RatingHistogram({ stats }) {
    if (!stats) return null;

    const max = Math.max(1, ...Object.values(stats.histogram));

    return (
        <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm text-zinc-400 font-medium">Ratings</span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {stats.count} {stats.count === 1 ? 'rating' : 'ratings'}
                </span>
            </div>

            <div className="space-y-1.5" role="list" aria-label="Rating distribution">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.histogram[star] || 0;
                    return (
                        <div key={star} role="listitem" className="flex items-center gap-2 text-xs">
                            <span className="w-6 flex items-center gap-0.5 text-zinc-400 font-bold">
                                {star}
                                <Star className="w-3 h-3 fill-current text-lime-400" />
                            </span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-lime-400 rounded-full transition-all"
                                    style={{ width: `${(count / max) * 100}%` }}
                                />
                            </div>
                            <span className="w-6 text-right text-zinc-500 font-medium">{count}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                {STATUS_LABELS.map(({ key, label }) => (
                    <div key={key}>
                        <div className="text-lg font-black text-white">{stats.statuses[key] || 0}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
