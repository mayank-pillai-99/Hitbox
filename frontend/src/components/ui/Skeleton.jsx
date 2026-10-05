// Placeholder blocks shown while data loads, shaped like what will replace them.
export function Skeleton({ className = '' }) {
    return <div aria-hidden="true" className={`animate-shimmer ${className}`} />;
}

const Busy = ({ label, children, className }) => (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
        <span className="sr-only">{label}</span>
        {children}
    </div>
);

export function GameGridSkeleton({ count = 12, className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' }) {
    return (
        <Busy label="Loading games" className={className}>
            {Array.from({ length: count }, (_, i) => (
                <div key={i}>
                    <Skeleton className="aspect-[3/4] border border-line" />
                    <Skeleton className="h-4 w-3/4 mt-3" />
                    <Skeleton className="h-3 w-1/3 mt-2" />
                </div>
            ))}
        </Busy>
    );
}

export function CardGridSkeleton({ count = 6, label = 'Loading', className = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' }) {
    return (
        <Busy label={label} className={className}>
            {Array.from({ length: count }, (_, i) => (
                <Skeleton key={i} className="h-48 border border-line" />
            ))}
        </Busy>
    );
}

export function ProfileSkeleton() {
    return (
        <Busy label="Loading profile" className="space-y-8">
            <div className="flex items-end gap-6">
                <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 border border-line" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-24 border border-line" />
                ))}
            </div>
            <Skeleton className="h-64 border border-line" />
        </Busy>
    );
}

export function ListRowsSkeleton({ count = 4 }) {
    return (
        <Busy label="Loading" className="space-y-3">
            {Array.from({ length: count }, (_, i) => (
                <Skeleton key={i} className="h-24 border border-line" />
            ))}
        </Busy>
    );
}
