'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gamepad2, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [search, setSearch] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/games?search=${encodeURIComponent(search)}`);
        }
    };

    return (
        <nav className="bg-black border-b border-zinc-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-lime-400">
                            <Gamepad2 className="w-6 h-6" />
                            HITBOX
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-6 text-sm">
                            <Link href="/games" className="text-zinc-400 hover:text-white transition-colors">
                                Games
                            </Link>
                            <Link href="/lists" className="text-zinc-400 hover:text-white transition-colors">
                                Lists
                            </Link>
                            <Link href="/members" className="text-zinc-400 hover:text-white transition-colors">
                                Members
                            </Link>
                            {user && (
                                <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">
                                    Profile
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hidden md:block relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 border border-zinc-800 rounded bg-zinc-900 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 text-sm transition-colors"
                                placeholder="Search title, dev, user..."
                            />
                        </form>

                        {/* Auth Buttons */}
                        {user ? (
                            <button
                                onClick={logout}
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm px-4 py-1.5 border border-zinc-700 rounded hover:border-lime-400 hover:text-lime-400 transition-colors"
                            >
                                LOG IN
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
