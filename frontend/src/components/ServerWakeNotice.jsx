'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Loader2 } from 'lucide-react';
import { oldestPendingSince, subscribe } from '@/utils/pendingRequests';

export const WAKE_NOTICE_DELAY_MS = 4000;

// If an API request has been waiting a few seconds, say why. Free hosting puts the server to sleep when
// it's quiet, and the first request afterwards can take up to a minute. Normal requests finish well
// inside the delay and never show this.
export default function ServerWakeNotice({ delayMs = WAKE_NOTICE_DELAY_MS }) {
    const since = useSyncExternalStore(subscribe, oldestPendingSince, () => null);
    const [now, setNow] = useState(0);

    useEffect(() => {
        if (since === null) return;
        // Check back when the oldest request reaches the delay, then keep the clock moving while it waits.
        const id = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(id);
    }, [since]);

    const visible = since !== null && now - since >= delayMs;
    if (!visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[28rem] z-[110] panel flex items-start gap-3 px-4 py-3 animate-fade-in"
            style={{ borderLeft: '4px solid var(--color-warn)' }}
        >
            <Loader2 className="w-5 h-5 mt-0.5 shrink-0 animate-spin text-warn" aria-hidden="true" />
            <p className="text-sm text-fg">
                The server was asleep and is waking up. This can take up to a minute, and then it will be quick again.
            </p>
        </div>
    );
}
