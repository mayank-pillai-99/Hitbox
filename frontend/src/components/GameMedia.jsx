'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Trailer (loaded only when clicked, so the page doesn't pull in YouTube up front)
// and a screenshot gallery with a keyboard-friendly lightbox.
export default function GameMedia({ extras, title }) {
    const [playing, setPlaying] = useState(false);
    const [open, setOpen] = useState(null); // index of the screenshot shown in the lightbox
    const closeRef = useRef(null);

    const screenshots = extras?.screenshots || [];
    const video = extras?.videos?.[0];

    useEffect(() => {
        if (open === null) return;

        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(null);
            if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % screenshots.length);
            if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + screenshots.length) % screenshots.length);
        };
        window.addEventListener('keydown', onKey);
        closeRef.current?.focus();
        return () => window.removeEventListener('keydown', onKey);
    }, [open, screenshots.length]);

    if (!video && screenshots.length === 0) return null;

    return (
        <section className="mb-12" aria-label={`${title} media`}>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-lime-400"></span>
                Media
            </h3>

            {video && (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 mb-4">
                    {playing ? (
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                            title={`${title}: ${video.name}`}
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        />
                    ) : (
                        <button
                            onClick={() => setPlaying(true)}
                            aria-label={`Play ${video.name}`}
                            className="group absolute inset-0 w-full h-full"
                        >
                            <img
                                src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                                alt=""
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-16 h-16 rounded-full bg-lime-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(163,230,53,0.4)] group-hover:scale-110 transition-transform">
                                    <Play className="w-7 h-7 fill-current ml-1" />
                                </span>
                            </span>
                            <span className="absolute bottom-3 left-4 text-sm font-bold text-white drop-shadow">{video.name}</span>
                        </button>
                    )}
                </div>
            )}

            {screenshots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {screenshots.map((shot, i) => (
                        <button
                            key={shot.full}
                            onClick={() => setOpen(i)}
                            aria-label={`Open screenshot ${i + 1} of ${screenshots.length}`}
                            className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-lime-400/50 transition-colors"
                        >
                            <img src={shot.thumb} alt={`${title} screenshot ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {open !== null && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${title} screenshot ${open + 1} of ${screenshots.length}`}
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setOpen(null)}
                >
                    <button
                        ref={closeRef}
                        onClick={() => setOpen(null)}
                        aria-label="Close"
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    {screenshots.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + screenshots.length) % screenshots.length); }}
                                aria-label="Previous screenshot"
                                className="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                                <ChevronLeft className="w-7 h-7" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % screenshots.length); }}
                                aria-label="Next screenshot"
                                className="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                                <ChevronRight className="w-7 h-7" />
                            </button>
                        </>
                    )}
                    <img
                        src={screenshots[open].full}
                        alt={`${title} screenshot ${open + 1}`}
                        className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
}
