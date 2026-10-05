import { Star } from 'lucide-react';

const STATUS_LABELS = [
    { key: 'played', label: 'Played', color: 'var(--color-neon)' },
    { key: 'playing', label: 'Playing', color: 'var(--color-scan)' },
    { key: 'want_to_play', label: 'Want to play', color: 'var(--color-warn)' },
];

// Rating distribution (5 stars at the top) and how many members track the game.
export default function RatingHistogram({ stats }) {
    if (!stats) return null;

    const max = Math.max(1, ...Object.values(stats.histogram));

    return (
        <section className="panel p-4" aria-label="Ratings">
            <div className="flex items-baseline justify-between mb-3">
                <h2 className="label text-neon">Ratings</h2>
                <span className="label">
                    {stats.count} {stats.count === 1 ? 'rating' : 'ratings'}
                </span>
            </div>

            <ul className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.histogram[star] || 0;
                    return (
                        <li key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-8 flex items-center gap-0.5 font-mono text-muted">
                                {star}
                                <Star className="w-3 h-3 fill-current text-neon" aria-hidden="true" />
                            </span>
                            <div
                                className="flex-1 h-3 bg-ink border border-line"
                                role="img"
                                aria-label={`${count} ${count === 1 ? 'review' : 'reviews'} with ${star} ${star === 1 ? 'star' : 'stars'}`}
                            >
                                <div className="h-full bg-neon" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                            <span className="w-6 text-right font-mono text-muted">{count}</span>
                        </li>
                    );
                })}
            </ul>

            <ul className="mt-4 pt-4 border-t border-line grid grid-cols-3 gap-2 text-center">
                {STATUS_LABELS.map(({ key, label, color }) => (
                    <li key={key}>
                        <div className="numeral text-2xl" style={{ WebkitTextStrokeColor: color }}>{stats.statuses[key] || 0}</div>
                        <div className="label mt-1">{label}</div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
