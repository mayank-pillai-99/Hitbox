import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

// A plain function, not vi.fn(): vitest reports a rejected promise returned by a spy as unhandled,
// even when the code under test handles it.
const calls = [];
let impl = () => Promise.resolve({ data: null });
vi.mock('@/utils/api', () => ({
    default: {
        get: (...args) => {
            calls.push(args);
            return impl(...args);
        },
    },
}));

const replace = vi.fn();
let pathname = '/profile';
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }), usePathname: () => pathname }));

let auth = { user: null, loading: true };
vi.mock('@/context/AuthContext', () => ({ useAuth: () => auth }));

const { default: useApi } = await import('@/hooks/useApi');
const { default: useRequireAuth } = await import('@/hooks/useRequireAuth');

const deferred = () => {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    return { promise, resolve };
};

describe('useApi', () => {
    beforeEach(() => {
        calls.length = 0;
        impl = () => Promise.resolve({ data: null });
    });

    it('loads, then returns the data', async () => {
        impl = () => Promise.resolve({ data: { hello: 'world' } });
        const { result } = renderHook(() => useApi('/x'));
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual({ hello: 'world' });
        expect(result.current.error).toBeNull();
    });

    it('reports an error', async () => {
        impl = () => Promise.reject(new Error('nope'));
        const { result } = renderHook(() => useApi('/x'));
        await waitFor(() => expect(result.current.error).toBeTruthy());
        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('passes params through and refetches when they change', async () => {
        impl = () => Promise.resolve({ data: 1 });
        const { rerender, result } = renderHook(({ page }) => useApi('/x', { page }), { initialProps: { page: 1 } });
        await waitFor(() => expect(result.current.data).toBe(1));
        expect(calls.at(-1)).toEqual(['/x', { params: { page: 1 } }]);

        rerender({ page: 2 });
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(calls.at(-1)).toEqual(['/x', { params: { page: 2 } }]));
    });

    it('ignores a slow response to an older request', async () => {
        const slow = deferred();
        impl = (path, options) => (options.params.page === 1 ? slow.promise : Promise.resolve({ data: 'page two' }));
        const { rerender, result } = renderHook(({ page }) => useApi('/x', { page }), { initialProps: { page: 1 } });
        rerender({ page: 2 });
        await waitFor(() => expect(result.current.data).toBe('page two'));

        await act(async () => { slow.resolve({ data: 'page one' }); });
        expect(result.current.data).toBe('page two');
    });

    it('keeps the old data visible while reloading', async () => {
        impl = () => Promise.resolve({ data: 'first' });
        const { result } = renderHook(() => useApi('/x'));
        await waitFor(() => expect(result.current.data).toBe('first'));

        const next = deferred();
        impl = () => next.promise;
        act(() => result.current.reload());
        expect(result.current.data).toBe('first');
        expect(result.current.loading).toBe(false);
        expect(result.current.refreshing).toBe(true);

        await act(async () => { next.resolve({ data: 'second' }); });
        await waitFor(() => expect(result.current.data).toBe('second'));
        expect(result.current.refreshing).toBe(false);
    });

    it('does nothing while disabled', async () => {
        const { result } = renderHook(() => useApi('/x', undefined, { enabled: false }));
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(calls).toHaveLength(0);
    });
});

describe('useRequireAuth', () => {
    beforeEach(() => {
        replace.mockReset();
        pathname = '/profile';
    });

    it('waits while auth is loading', () => {
        auth = { user: null, loading: true };
        const { result } = renderHook(() => useRequireAuth());
        expect(replace).not.toHaveBeenCalled();
        expect(result.current.ready).toBe(false);
    });

    it('sends an anonymous visitor to login, remembering where they were', () => {
        auth = { user: null, loading: false };
        const { result } = renderHook(() => useRequireAuth());
        expect(replace).toHaveBeenCalledWith('/login?next=%2Fprofile');
        expect(result.current.ready).toBe(false);
    });

    it('is ready for a signed-in member and does not redirect', () => {
        auth = { user: { username: 'dana' }, loading: false };
        const { result } = renderHook(() => useRequireAuth());
        expect(replace).not.toHaveBeenCalled();
        expect(result.current).toMatchObject({ ready: true, user: { username: 'dana' } });
    });
});
