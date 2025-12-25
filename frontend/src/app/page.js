import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import { TrendingUp, Calendar } from 'lucide-react';

// Mock Data
const TRENDING_GAMES = [
    { id: 1, title: "Elden Ring", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg", rating: 4.8, releaseYear: 2022 },
    { id: 2, title: "Baldur's Gate 3", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg", rating: 4.9, releaseYear: 2023 },
    { id: 3, title: "Cyberpunk 2077", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co848y.jpg", rating: 4.2, releaseYear: 2020 },
    { id: 4, title: "God of War Ragnarök", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg", rating: 4.7, releaseYear: 2022 },
    { id: 5, title: "The Legend of Zelda: Tears of the Kingdom", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg", rating: 4.8, releaseYear: 2023 },
    { id: 6, title: "Hades II", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co84j3.jpg", rating: 4.6, releaseYear: 2024 },
];

const NEW_RELEASES = [
    { id: 7, title: "Final Fantasy VII Rebirth", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7i7a.jpg", rating: 4.7, releaseYear: 2024 },
    { id: 8, title: "Helldivers 2", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co798v.jpg", rating: 4.5, releaseYear: 2024 },
    { id: 9, title: "Dragon's Dogma 2", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7x3j.jpg", rating: 4.0, releaseYear: 2024 },
    { id: 10, title: "Persona 3 Reload", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6ozh.jpg", rating: 4.6, releaseYear: 2024 },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            <div className="space-y-12 pb-12">
                {/* Hero Section */}
                <section className="relative bg-zinc-900 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                    <div className="relative max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
                            Track your <span className="text-emerald-500">gaming journey</span>.
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto mb-10">
                            Hitbox is the social network for gamers. Rate games, write reviews, and create lists of your favorites.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors">
                                Get Started
                            </button>
                            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors border border-zinc-700">
                                Browse Games
                            </button>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    {/* Trending Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" />
                                <h2 className="text-2xl font-bold text-white">Trending This Week</h2>
                            </div>
                            <span className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">View all</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {TRENDING_GAMES.map(game => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </section>

                    {/* New Releases Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-emerald-500" />
                                <h2 className="text-2xl font-bold text-white">New Releases</h2>
                            </div>
                            <span className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">View all</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {NEW_RELEASES.map(game => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
