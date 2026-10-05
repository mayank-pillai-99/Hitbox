// Tracks API requests that are still in flight, so the UI can tell when the server is slow to answer
// (a sleeping free-tier host can take up to a minute to wake). A tiny store for useSyncExternalStore.

const pending = new Map(); // id -> start time
const listeners = new Set();
let nextId = 0;

const notify = () => listeners.forEach((listener) => listener());

// Call when a request starts; call the returned function when it finishes (success or failure).
export function trackRequest() {
    const id = ++nextId;
    pending.set(id, Date.now());
    notify();
    return () => {
        if (pending.delete(id)) notify();
    };
}

export const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// When the longest-waiting request started, or null if nothing is pending. A number keeps the
// snapshot stable between renders, as useSyncExternalStore requires.
export const oldestPendingSince = () => (pending.size === 0 ? null : Math.min(...pending.values()));

export const resetPendingRequests = () => {
    pending.clear();
    notify();
};
