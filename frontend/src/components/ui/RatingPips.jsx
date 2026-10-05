// Five square pips, filled up to the rating.
export default function RatingPips({ rating, size = 10 }) {
    return (
        <span role="img" aria-label={`Rated ${rating} out of 5`} className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    aria-hidden="true"
                    style={{ width: size, height: size }}
                    className={n <= rating ? 'bg-neon' : 'bg-line-strong'}
                />
            ))}
        </span>
    );
}
