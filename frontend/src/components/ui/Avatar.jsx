// A member's picture, or their initial when there is none (or it fails to load).
// Pictures are user-supplied URLs on arbitrary hosts, so this stays a plain <img>.
'use client';

import { useState } from 'react';

export default function Avatar({ user, size = 40, className = '', label = '' }) {
    const [failed, setFailed] = useState(false);
    const initial = (user?.username || '?').charAt(0).toUpperCase();
    const showImage = user?.profilePicture && !failed;

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-panel-2 border border-line-strong ${className}`}
            style={{ width: size, height: size }}
        >
            {showImage ? (
                <img
                    src={user.profilePicture}
                    // Usually sits next to the username, so it is decorative unless a label is given.
                    alt={label}
                    onError={() => setFailed(true)}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span
                    className="display text-neon"
                    style={{ fontSize: Math.max(12, Math.round(size * 0.42)) }}
                    aria-hidden={label ? undefined : true}
                >
                    {initial}
                </span>
            )}
        </span>
    );
}
