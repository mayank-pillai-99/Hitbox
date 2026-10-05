import { AlertTriangle } from 'lucide-react';

// A failed load, with a retry that re-runs the request instead of reloading the page.
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
    return (
        <div
            role="alert"
            className="panel p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ borderLeft: '4px solid var(--color-hot)' }}
        >
            <AlertTriangle className="w-6 h-6 text-hot shrink-0" aria-hidden="true" />
            <p className="flex-1 text-fg">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn-ghost">
                    Try again
                </button>
            )}
        </div>
    );
}
