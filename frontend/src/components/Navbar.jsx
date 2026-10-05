'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import SearchBox from '@/components/SearchBox';

const LINKS = [
    { href: '/games', label: 'Games' },
    { href: '/lists', label: 'Lists' },
    { href: '/members', label: 'Members' },
];

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

// Account menu: a disclosure button that closes on Escape, on outside click and when a link is used.
function AccountMenu({ user, logout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onPointer = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const item = 'block w-full text-left px-4 min-h-[44px] flex items-center text-sm font-bold uppercase tracking-wide text-muted hover:text-neon hover:bg-panel-2';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="true"
                className="flex items-center gap-2 min-h-[44px] px-2 hover:text-neon"
            >
                <Avatar user={user} size={28} />
                <span className="label text-fg hidden lg:inline">{user.username}</span>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Account menu</span>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-48 panel z-50">
                    <Link href="/profile" onClick={() => setOpen(false)} className={item}>Profile</Link>
                    <Link href="/settings" onClick={() => setOpen(false)} className={item}>Settings</Link>
                    <button onClick={() => { setOpen(false); logout(); }} className={`${item} border-t border-line`}>Log out</button>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMenu = () => setMobileOpen(false);

    const linkClass = (href) =>
        `relative flex items-center min-h-[44px] label hover:text-fg ${isActive(pathname, href) ? 'text-fg' : ''}`;

    return (
        <header className="bg-ink border-b border-line sticky top-0 z-40">
            <nav aria-label="Main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 min-h-[44px]" aria-label="Hitbox home">
                        <span className="w-4 h-4 bg-neon chamfer" aria-hidden="true" />
                        <span className="display text-xl text-fg">Hitbox</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {LINKS.map(({ href, label }) => (
                            <Link key={href} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} className={linkClass(href)}>
                                {label}
                                {isActive(pathname, href) && <span className="absolute left-0 right-0 bottom-1 h-[3px] bg-neon" aria-hidden="true" />}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <SearchBox id="site-search" className="w-52 lg:w-72" />
                        {user ? (
                            <AccountMenu user={user} logout={logout} />
                        ) : (
                            <Link href="/login" className="btn-ghost">Log in</Link>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        className="md:hidden w-11 h-11 flex items-center justify-center text-muted hover:text-neon"
                    >
                        {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div id="mobile-menu" className="md:hidden border-t border-line bg-ink">
                    <div className="px-4 py-4 space-y-4">
                        <SearchBox id="site-search-mobile" onNavigate={closeMenu} />

                        <ul>
                            {LINKS.map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        onClick={closeMenu}
                                        aria-current={isActive(pathname, href) ? 'page' : undefined}
                                        className={`flex items-center min-h-[44px] px-3 font-bold uppercase tracking-wide hover:text-neon ${isActive(pathname, href) ? 'text-neon border-l-4 border-neon' : 'text-muted'}`}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                            {user && (
                                <>
                                    <li><Link href="/profile" onClick={closeMenu} className="flex items-center min-h-[44px] px-3 font-bold uppercase tracking-wide text-muted hover:text-neon">Profile</Link></li>
                                    <li><Link href="/settings" onClick={closeMenu} className="flex items-center min-h-[44px] px-3 font-bold uppercase tracking-wide text-muted hover:text-neon">Settings</Link></li>
                                </>
                            )}
                        </ul>

                        <div className="pt-3 border-t border-line">
                            {user ? (
                                <button onClick={() => { logout(); closeMenu(); }} className="btn-ghost w-full">Log out</button>
                            ) : (
                                <Link href="/login" onClick={closeMenu} className="btn-primary w-full">Log in</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
