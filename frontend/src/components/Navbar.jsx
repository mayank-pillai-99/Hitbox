'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gamepad2, Search, User, LogOut } from 'lucide-react';
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
        <nav className="bg-zinc-900 border-b border-zinc-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-emerald-500">
                            <Gamepad2 className="w-8 h-8" />
                            HITBOX
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-zinc-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-full leading-5 bg-zinc-800 text-zinc-300 placeholder-zinc-400 focus:outline-none focus:bg-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-colors"
                                placeholder="Search games..."
                            />
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/games" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Games
                            </Link>
                            <Link href="/members" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Members
                            </Link>
                            <Link href="/lists" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Lists
                            </Link>

                            {user ? (
                                <>
                                    <Link href="/profile" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Profile
                                    </Link>
                                    <button onClick={logout} className="hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Log In
                                    </Link>
                                    <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
