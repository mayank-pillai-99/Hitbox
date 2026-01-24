'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gamepad2, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/games?search=${encodeURIComponent(search)}`);
            setMobileOpen(false);
        }
    };

    const closeMenu = () => setMobileOpen(false);

    return (
        <nav className="bg-black border-b border-zinc-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-lime-400">
                        <Gamepad2 className="w-6 h-6" />
                        HITBOX
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm">
                        <Link href="/games" className="text-zinc-400 hover:text-white transition-colors">Games</Link>
                        <Link href="/lists" className="text-zinc-400 hover:text-white transition-colors">Lists</Link>
                        <Link href="/members" className="text-zinc-400 hover:text-white transition-colors">Members</Link>
                        {user && <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">Profile</Link>}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 border border-zinc-800 rounded bg-zinc-900 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 text-sm transition-colors"
                                placeholder="Search games..."
                            />
                        </form>

                        {user ? (
                            <button onClick={logout} className="text-sm text-zinc-400 hover:text-white transition-colors">Logout</button>
                        ) : (
                            <Link href="/login" className="text-sm px-4 py-1.5 border border-zinc-700 rounded hover:border-lime-400 hover:text-lime-400 transition-colors">
                                LOG IN
                            </Link>
                        )}
                    </div>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-zinc-900 bg-black">
                    <div className="px-4 py-4 space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 border border-zinc-800 rounded bg-zinc-900 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 text-sm transition-colors"
                                placeholder="Search games..."
                            />
                        </form>

                        <div className="flex flex-col space-y-1">
                            <Link href="/games" onClick={closeMenu} className="px-3 py-2.5 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded transition-colors">Games</Link>
                            <Link href="/lists" onClick={closeMenu} className="px-3 py-2.5 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded transition-colors">Lists</Link>
                            <Link href="/members" onClick={closeMenu} className="px-3 py-2.5 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded transition-colors">Members</Link>
                            {user && <Link href="/profile" onClick={closeMenu} className="px-3 py-2.5 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded transition-colors">Profile</Link>}
                        </div>

                        <div className="pt-2 border-t border-zinc-800">
                            {user ? (
                                <button onClick={() => { logout(); closeMenu(); }} className="w-full px-3 py-2.5 text-left text-zinc-400 hover:bg-zinc-900 hover:text-white rounded transition-colors">Logout</button>
                            ) : (
                                <Link href="/login" onClick={closeMenu} className="block w-full text-center py-2.5 border border-lime-400 text-lime-400 rounded hover:bg-lime-400 hover:text-black transition-colors font-medium">
                                    LOG IN
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
