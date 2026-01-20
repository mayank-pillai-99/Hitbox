'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="px-6 lg:px-12 py-12 border-t border-zinc-900 bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-4">HitBox</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/games" className="hover:text-white transition-colors">Games</Link></li>
                            <li><Link href="/lists" className="hover:text-white transition-colors">Lists</Link></li>
                            <li><Link href="/members" className="hover:text-white transition-colors">Members</Link></li>
                            <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-4">Social</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Discord</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                        </ul>
                    </div>
                    <div className="text-sm text-zinc-600">
                        <div className="flex items-center gap-2 text-lime-400 font-black text-lg mb-3">
                            <Gamepad2 className="w-5 h-5" />
                            HITBOX
                        </div>
                        <p>© 2025 HitBox.</p>
                        <p>Data provided by IGDB.</p>
                        <p className="mt-2 text-zinc-500">Made for the love of the game.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
