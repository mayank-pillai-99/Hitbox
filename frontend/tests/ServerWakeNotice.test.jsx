import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import ServerWakeNotice from '@/components/ServerWakeNotice';
import { oldestPendingSince, resetPendingRequests, trackRequest } from '@/utils/pendingRequests';

beforeEach(() => {
    vi.useFakeTimers();
    resetPendingRequests();
});

afterEach(() => {
    resetPendingRequests();
    vi.useRealTimers();
});

describe('pending request tracker', () => {
    it('reports when the longest-waiting request started', () => {
        expect(oldestPendingSince()).toBeNull();
        const first = Date.now();
        const done1 = trackRequest();
        vi.advanceTimersByTime(1000);
        const done2 = trackRequest();
        expect(oldestPendingSince()).toBe(first);
        done1();
        expect(oldestPendingSince()).toBe(first + 1000);
        done2();
        expect(oldestPendingSince()).toBeNull();
    });

    it('ignores finishing the same request twice', () => {
        const done = trackRequest();
        done();
        expect(() => done()).not.toThrow();
        expect(oldestPendingSince()).toBeNull();
    });
});

describe('ServerWakeNotice', () => {
    it('shows nothing when no request is waiting', () => {
        render(<ServerWakeNotice />);
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('stays hidden for a request that finishes quickly', () => {
        render(<ServerWakeNotice delayMs={4000} />);
        let done;
        act(() => { done = trackRequest(); });
        act(() => { vi.advanceTimersByTime(2000); });
        expect(screen.queryByRole('status')).toBeNull();
        act(() => done());
        act(() => { vi.advanceTimersByTime(5000); });
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('explains a slow request once it passes the delay', () => {
        render(<ServerWakeNotice delayMs={4000} />);
        act(() => { trackRequest(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(screen.queryByRole('status')).toBeNull();
        act(() => { vi.advanceTimersByTime(1500); });
        expect(screen.getByRole('status')).toHaveTextContent(/server was asleep and is waking up/i);
    });

    it('goes away when the request finally finishes', () => {
        render(<ServerWakeNotice delayMs={4000} />);
        let done;
        act(() => { done = trackRequest(); });
        act(() => { vi.advanceTimersByTime(6000); });
        expect(screen.getByRole('status')).toBeInTheDocument();
        act(() => done());
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('does not show again for a fresh quick request after a slow one', () => {
        render(<ServerWakeNotice delayMs={4000} />);
        let slow;
        act(() => { slow = trackRequest(); });
        act(() => { vi.advanceTimersByTime(6000); });
        act(() => slow());

        let quick;
        act(() => { quick = trackRequest(); });
        act(() => { vi.advanceTimersByTime(1000); });
        expect(screen.queryByRole('status')).toBeNull();
        act(() => quick());
    });
});
