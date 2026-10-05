'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';

// GET a path and track loading and error state. Changing `path` or `params`, or calling `reload()`,
// starts a new request, and a response that arrives after that is ignored, so a slow older request
// can't overwrite a newer one. Pass `enabled: false` to wait (for example until the user is known).
//
// - `loading` is true only until the first result for the current path and params arrives.
// - `reload()` keeps showing the previous data while it refetches (`refreshing` is true meanwhile),
//   so refreshing after an edit doesn't flash a skeleton or unmount the page.
//
// Loading is derived from "the stored result belongs to a different request", rather than being set
// inside the effect, which keeps renders to a minimum.
export default function useApi(path, params, { enabled = true } = {}) {
    const [tick, setTick] = useState(0);
    const [result, setResult] = useState({ base: null, key: null, data: null, error: null });

    const base = enabled && path ? `${path}?${JSON.stringify(params ?? {})}` : null;
    const key = base && `${base}#${tick}`;

    useEffect(() => {
        if (!key) return;
        let cancelled = false;

        api.get(path, { params })
            .then((res) => { if (!cancelled) setResult({ base, key, data: res.data, error: null }); })
            .catch((error) => { if (!cancelled) setResult({ base, key, data: null, error }); });

        return () => { cancelled = true; };
        // `params` is represented by `base`; listing the object itself would refetch on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const hasResult = base !== null && result.base === base;
    return {
        data: hasResult ? result.data : null,
        error: hasResult ? result.error : null,
        loading: base !== null && !hasResult,
        refreshing: hasResult && result.key !== key,
        reload: () => setTick((t) => t + 1),
    };
}
