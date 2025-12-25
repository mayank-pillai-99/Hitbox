import Link from 'next/link';
import { Settings } from 'lucide-react';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';

// Mock User Data
const USER = {
    username: "PixelPioneer",
    bio: "RPG enthusiast and indie game lover.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    stats: {
        gamesPlayed: 42,
        reviews: 15,
        lists: 4
    },
    lists: [
        {
            id: 1, name: "Currently Playing", count: 3, games: [
                { id: 1, title: "Elden Ring", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg", rating: 4.8 },
                { id: 8, title: "Helldivers 2", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co798v.jpg", rating: 4.5 },
                { id: 10, title: "Persona 3 Reload", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6ozh.jpg", rating: 4.6 },
            ]
        },
        {
            id: 2, name: "Completed 2024", count: 12, games: [
                { id: 7, title: "Final Fantasy VII Rebirth", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7i7a.jpg", rating: 4.7 },
                { id: 9, title: "Dragon's Dogma 2", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7x3j.jpg", rating: 4.0 },
            ]
        },
        { id: 3, name: "Wishlist", count: 25, games: [] },
        { id: 4, name: "Abandoned", count: 2, games: [] },
    ]
};

export default function Profile() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            <div className="bg-zinc-900 border-b border-zinc-800 pt-10 pb-10 px-4">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl">
                        <img src={USER.avatar} alt={USER.username} className="w-full h-full object-cover" />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-white">{USER.username}</h1>
                            <Link href="/settings" className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 transition-colors border border-zinc-700">
                                <Settings className="w-4 h-4" /> Edit Profile
                            </Link>
                        </div>
                        <p className="text-zinc-400 mb-6 max-w-md">{USER.bio}</p>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 border-t border-zinc-800 pt-4">
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{USER.stats.gamesPlayed}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Games</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{USER.stats.reviews}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{USER.stats.lists}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Lists</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
                {/* Lists Section */}
                {USER.lists.map(list => (
                    <section key={list.id}>
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                            <h2 className="text-xl font-bold text-white">{list.name} <span className="text-zinc-500 text-sm font-normal">({list.count})</span></h2>
                            <Link href={`/lists/${list.id}`} className="text-sm text-emerald-500 hover:text-emerald-400">View all</Link>
                        </div>

                        {list.games.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {list.games.map(game => (
                                    <GameCard key={game.id} game={game} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 rounded-lg p-8 text-center border border-zinc-800 border-dashed">
                                <p className="text-zinc-500">No games in this list yet.</p>
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
