import Link from 'next/link';

const NAV = [
    { href: '/', label: 'Home' },
    { href: '/games', label: 'Games' },
    { href: '/lists', label: 'Lists' },
    { href: '/members', label: 'Members' },
];

export default function Footer() {
    return (
        <footer className="border-t border-line bg-ink mt-auto">
            <div className="stripes opacity-60" aria-hidden="true" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-3">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-4 h-4 bg-neon chamfer" aria-hidden="true" />
                        <span className="display text-xl">Hitbox</span>
                    </div>
                    <p className="text-sm text-muted">Track, review and share the games you play.</p>
                </div>

                <nav aria-label="Footer">
                    <h2 className="label text-neon mb-3">Explore</h2>
                    <ul className="space-y-1">
                        {NAV.map(({ href, label }) => (
                            <li key={href}>
                                <Link href={href} className="inline-flex items-center min-h-[44px] text-sm text-muted hover:text-neon">{label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <h2 className="label text-neon mb-3">About</h2>
                    <ul className="space-y-1 text-sm text-muted">
                        <li>
                            <a href="https://github.com/mayank-pillai-99/Hitbox" className="inline-flex items-center min-h-[44px] hover:text-neon" rel="noopener noreferrer">
                                Source on GitHub
                            </a>
                        </li>
                        <li className="label min-h-[44px] flex items-center">Game data from IGDB</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-line">
                <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 label">
                    &copy; {new Date().getFullYear()} Hitbox
                </p>
            </div>
        </footer>
    );
}
