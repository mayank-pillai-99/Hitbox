// A big outlined number with a mono caption, for profile and member stats.
export default function StatTile({ label, value, accent = false }) {
    return (
        <div className={`panel p-4 min-w-0 ${accent ? 'panel-accent' : ''}`}>
            <div className="numeral text-4xl sm:text-5xl">{value}</div>
            <div className="label mt-2">{label}</div>
        </div>
    );
}
