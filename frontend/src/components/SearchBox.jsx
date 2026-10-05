'use client';

import { useState, useEffect, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import Avatar from '@/components/ui/Avatar';
import GameCover from '@/components/ui/GameCover';

const MIN_CHARS = 2;

const defaultFetcher = (q) => api.get('/search', { params: { q } }).then((res) => res.data);

// Flattens grouped results into one ordered list of options, so keyboard navigation can walk them.
// The last option always goes to the full games search.
export function buildOptions(results, q) {
    const options = [];
    for (const game of results?.games ?? []) {
        options.push({ group: 'Games', key: `game-${game._id}`, href: `/games/${game._id}`, game, label: game.title });
    }
    for (const member of results?.members ?? []) {
        options.push({ group: 'Members', key: `member-${member._id}`, href: `/users/${member.username}`, member, label: member.username });
    }
    for (const list of results?.lists ?? []) {
        options.push({ group: 'Lists', key: `list-${list._id}`, href: `/lists/${list._id}`, list, label: list.name });
    }
    options.push({ group: null, key: 'all', href: `/games?search=${encodeURIComponent(q)}`, label: `See all game results for "${q}"`, isAll: true });
    return options;
}

// Search-as-you-type across games, members and lists (the ARIA combobox pattern: focus stays in the
// input, arrow keys move through the options, Enter opens one, Esc closes). `fetcher` is injectable for tests.
export default function SearchBox({ id, fetcher = defaultFetcher, onNavigate, debounceMs = 250, className = '' }) {
    const router = useRouter();
    const generatedId = useId();
    const baseId = id || generatedId;
    const listId = `${baseId}-listbox`;
    const rootRef = useRef(null);

    const [value, setValue] = useState('');
    const [debounced, setDebounced] = useState('');
    const [result, setResult] = useState({ q: '', data: null, failed: false });
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

    const typed = value.trim();
    const ready = typed.length >= MIN_CHARS;

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(typed), debounceMs);
        return () => clearTimeout(timer);
    }, [typed, debounceMs]);

    useEffect(() => {
        if (debounced.length < MIN_CHARS) return;
        let cancelled = false;
        fetcher(debounced)
            .then((data) => { if (!cancelled) setResult({ q: debounced, data, failed: false }); })
            .catch(() => { if (!cancelled) setResult({ q: debounced, data: null, failed: true }); });
        return () => { cancelled = true; };
    }, [debounced, fetcher]);

    useEffect(() => {
        if (!open) return;
        const onPointer = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onPointer);
        return () => document.removeEventListener('mousedown', onPointer);
    }, [open]);

    // Results belong to a specific query; until the debounced query has answered, we are loading.
    const settled = ready && result.q === typed;
    const loading = ready && !settled && !(result.q === debounced && result.failed);
    const options = settled && !result.failed ? buildOptions(result.data, typed) : [];
    const showList = open && ready;
    const activeId = active >= 0 && active < options.length ? `${baseId}-opt-${active}` : undefined;

    const go = (href) => {
        setOpen(false);
        setActive(-1);
        setValue('');
        router.push(href);
        onNavigate?.();
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!ready) return;
            e.preventDefault();
            setOpen(true);
            if (options.length === 0) return;
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActive((current) => (current + step + options.length) % options.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeId !== undefined) go(options[active].href);
            else if (typed) go(`/games?search=${encodeURIComponent(typed)}`);
        } else if (e.key === 'Escape') {
            if (open) setOpen(false);
            else setValue('');
            setActive(-1);
        }
    };

    // A group's heading goes above its first option.
    const headings = options.map((option, i) => (option.group && option.group !== options[i - 1]?.group ? option.group : null));

    return (
        <div ref={rootRef} className={`relative ${className}`} role="search">
            <label htmlFor={baseId} className="sr-only">Search games, members and lists</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" aria-hidden="true" />
            <input
                id={baseId}
                type="text"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                autoComplete="off"
                value={value}
                onChange={(e) => { setValue(e.target.value); setOpen(true); setActive(-1); }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="Search Hitbox"
                className="field pl-9 pr-9"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-dim" aria-hidden="true" />}

            {showList && (
                <div className="absolute left-0 right-0 top-full mt-1 panel z-50 max-h-[70vh] overflow-y-auto min-w-[18rem] sm:min-w-[22rem]">
                    <ul id={listId} role="listbox" aria-label="Search results">
                        {options.map((option, index) => {
                            const heading = headings[index];
                            return (
                                <li key={option.key} role="presentation">
                                    {heading && <div className="label px-3 pt-3 pb-1 text-neon" aria-hidden="true">{heading}</div>}
                                    <div
                                        id={`${baseId}-opt-${index}`}
                                        role="option"
                                        aria-selected={index === active}
                                        aria-label={option.group ? `${option.group.slice(0, -1)}: ${option.label}` : option.label}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => go(option.href)}
                                        onMouseEnter={() => setActive(index)}
                                        className={`flex items-center gap-3 px-3 min-h-[44px] cursor-pointer ${index === active ? 'bg-panel-2 text-neon' : ''} ${option.isAll ? 'border-t border-line mt-1 label !text-fg' : ''}`}
                                    >
                                        {option.game && (
                                            <>
                                                <span className="w-8 aspect-[3/4] shrink-0 border border-line overflow-hidden" aria-hidden="true">
                                                    <GameCover src={option.game.coverImage} title={option.game.title} className="w-full h-full" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate font-bold">{option.game.title}</span>
                                                    <span className="label">{option.game.releaseDate ? new Date(option.game.releaseDate).getFullYear() : 'TBA'}</span>
                                                </span>
                                            </>
                                        )}
                                        {option.member && (
                                            <>
                                                <Avatar user={option.member} size={32} />
                                                <span className="font-bold truncate">{option.member.username}</span>
                                            </>
                                        )}
                                        {option.list && (
                                            <span className="min-w-0">
                                                <span className="block truncate font-bold">{option.list.name}</span>
                                                <span className="label">
                                                    {option.list.gameCount} {option.list.gameCount === 1 ? 'game' : 'games'}
                                                    {option.list.user && ` by ${option.list.user.username}`}
                                                </span>
                                            </span>
                                        )}
                                        {option.isAll && option.label}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div role="status" aria-live="polite" className="px-3 py-2 label">
                        {loading && 'Searching...'}
                        {settled && result.failed && 'Search is unavailable right now.'}
                        {!loading && !result.failed && settled && options.length === 1 && 'No matches.'}
                    </div>
                </div>
            )}
        </div>
    );
}
