'use client';

import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

// A cover image that falls back to a labelled block when there is no URL or it fails to load.
export default function GameCover({ src, title, className = '' }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                role="img"
                aria-label={title ? `${title} (no cover)` : 'No cover'}
                className={`flex flex-col items-center justify-center gap-2 bg-panel-2 text-dim ${className}`}
            >
                <Gamepad2 className="w-8 h-8" aria-hidden="true" />
                {title && <span className="label px-2 text-center line-clamp-2">{title}</span>}
            </div>
        );
    }

    return <img src={src} alt={title || ''} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
