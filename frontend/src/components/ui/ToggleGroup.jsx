// A row of mutually exclusive buttons (sort order, view mode). The active one is `aria-pressed`.
export default function ToggleGroup({ label, options, value, onChange, className = '' }) {
    return (
        <div role="group" aria-label={label} className={`flex gap-2 ${className}`}>
            {options.map(([optionValue, optionLabel]) => (
                <button
                    key={optionValue}
                    onClick={() => onChange(optionValue)}
                    aria-pressed={value === optionValue}
                    className={`min-h-[44px] px-4 border text-sm font-bold uppercase tracking-wide transition-colors ${
                        value === optionValue ? 'bg-neon text-black border-neon' : 'border-line-strong text-muted hover:border-neon hover:text-neon'
                    }`}
                >
                    {optionLabel}
                </button>
            ))}
        </div>
    );
}
