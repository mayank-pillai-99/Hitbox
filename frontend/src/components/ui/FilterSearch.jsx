'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

// A search field for narrowing a list. Submitting (Enter) applies it, so the URL holds the term.
// `key` the component by `value` so it resets when the URL changes elsewhere (e.g. back button).
export default function FilterSearch({ label, value, onSubmit, placeholder }) {
    const [text, setText] = useState(value);

    return (
        <form
            role="search"
            onSubmit={(e) => { e.preventDefault(); onSubmit(text.trim()); }}
            className="relative w-full md:w-72"
        >
            <label htmlFor="filter-search" className="sr-only">{label}</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" aria-hidden="true" />
            <input
                id="filter-search"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                maxLength={60}
                className="field pl-9 pr-11"
            />
            {text && (
                <button
                    type="button"
                    onClick={() => { setText(''); onSubmit(''); }}
                    aria-label="Clear search"
                    className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-muted hover:text-neon"
                >
                    <X className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
        </form>
    );
}
