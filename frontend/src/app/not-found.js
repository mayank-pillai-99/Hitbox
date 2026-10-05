import Link from 'next/link';
import PageShell from '@/components/ui/PageShell';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
    return (
        <PageShell>
            <div className="max-w-xl mx-auto text-center py-12">
                <p className="numeral text-8xl sm:text-9xl" aria-hidden="true">404</p>
                <h1 className="display text-3xl sm:text-4xl mt-4">Page not found</h1>
                <p className="mt-3 text-muted">That page doesn&apos;t exist, or it has moved.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/" className="btn-primary">Back home</Link>
                    <Link href="/games" className="btn-ghost">Browse games</Link>
                </div>
            </div>
        </PageShell>
    );
}
