import { ChevronLeft, ChevronRight } from 'lucide-react';

// Previous / next with the current page. `totalPages` is optional (the games list doesn't know it).
export default function Pager({ page, totalPages, hasNext, onChange }) {
    const canNext = hasNext ?? (totalPages ? page < totalPages : false);

    return (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-4 mt-10">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                className="btn-ghost w-11 px-0"
            >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <span className="label text-fg" aria-current="page">
                Page {page}
                {totalPages ? ` / ${totalPages}` : ''}
            </span>
            <button
                onClick={() => onChange(page + 1)}
                disabled={!canNext}
                aria-label="Next page"
                className="btn-ghost w-11 px-0"
            >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
        </nav>
    );
}
