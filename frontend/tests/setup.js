import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

// next/link needs the App Router at runtime; tests only care that it renders an anchor.
vi.mock('next/link', async () => {
    const React = await import('react');
    return {
        default: ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children),
    };
});
