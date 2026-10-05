'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';

// GET a path and track loading and error state. Changing `path` or `params`, or calling `reload()`,
// starts a new request, and a response that arrives after that is ignored, so a slow older request
// can't overwrite a newer one. Pass `enabled: false` to wait (for example until the user is known).
//
// Loading is derived from "the stored result belongs to a different request", rather than being set
// inside the effect, which keeps renders to a minimum.
export default function useApi(path, params, { enabled = true } = {}) {
    const [tick, setTick] = useState(0);
    const [result, setResult] = useState({ key: null, data: null, error: null });

    const key = enabled && path ? `${path}?${JSON.stringify(params ?? {})}#${tick}` : null;

    useEffect(() => {
        if (!key) return;
        let cancelled = false;

        api.get(path, { params })
            .then((res) => { if (!cancelled) setResult({ key, data: res.data, error: null }); })
            .catch((error) => { if (!cancelled) setResult({ key, data: null, error }); });

        return () => { cancelled = true; };
        // `params` is represented by `key`; listing the object itself would refetch on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const current = key !== null && result.key === key;
    return {
        data: current ? result.data : null,
        error: current ? result.error : null,
        loading: key !== null && !current,
        reload: () => setTick((t) => t + 1),
    };
}
