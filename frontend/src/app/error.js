'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PageShell from '@/components/ui/PageShell';

// Shown when a page throws while rendering. `reset` re-renders the segment.
export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <PageShell>
            <div role="alert" className="max-w-xl mx-auto text-center py-12">
                <p className="label text-hot">Something broke</p>
                <h1 className="display text-3xl sm:text-4xl mt-2">That didn&apos;t work</h1>
                <p className="mt-3 text-muted">An unexpected error stopped this page from loading. Trying again often fixes it.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button onClick={reset} className="btn-primary">Try again</button>
                    <Link href="/" className="btn-ghost">Back home</Link>
                </div>
            </div>
        </PageShell>
    );
}
