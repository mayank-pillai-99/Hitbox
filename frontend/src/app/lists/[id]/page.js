import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { User, Calendar, MoreHorizontal } from 'lucide-react';

// Mock Data
const LIST_DATA = {
    id: 1,
    name: "Top 10 RPGs of All Time",
    description: "A collection of the best Role-Playing Games I've ever played. From turn-based classics to modern action RPGs.",
    author: {
        username: "PixelPioneer",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
    },
    createdAt: "Dec 2023",
    games: [
        { id: 1, title: "Elden Ring", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg", rating: 4.8, releaseYear: 2022 },
        { id: 2, title: "Baldur's Gate 3", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg", rating: 4.9, releaseYear: 2023 },
        { id: 3, title: "Cyberpunk 2077", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co848y.jpg", rating: 4.2, releaseYear: 2020 },
        { id: 7, title: "Final Fantasy VII Rebirth", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7i7a.jpg", rating: 4.7, releaseYear: 2024 },
        { id: 10, title: "Persona 3 Reload", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6ozh.jpg", rating: 4.6, releaseYear: 2024 },
    ]
};

export default function ListDetails({ params }) {
    const list = LIST_DATA;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            <div className="bg-zinc-900 border-b border-zinc-800 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{list.name}</h1>
                            <p className="text-zinc-400 text-lg mb-6 leading-relaxed max-w-2xl">{list.description}</p>

                            <div className="flex items-center gap-6 text-sm text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <img src={list.author.avatar} alt={list.author.username} className="w-6 h-6 rounded-full" />
                                    <span className="text-zinc-300 font-medium">Created by {list.author.username}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{list.createdAt}</span>
                                </div>
                                <div>
                                    <span className="text-white font-bold">{list.games.length}</span> games
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors">
                                Edit List
                            </button>
                            <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-4">
                    {list.games.map((game, index) => (
                        <div key={game.id} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors group">
                            <div className="flex-shrink-0 w-8 text-center font-mono text-zinc-500 text-lg">
                                {index + 1}
                            </div>

                            <Link href={`/games/${game.id}`} className="flex-shrink-0 w-16 h-24 rounded overflow-hidden shadow-lg">
                                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link href={`/games/${game.id}`} className="text-lg font-bold text-white hover:text-emerald-500 transition-colors truncate block">
                                    {game.title}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                    <span>{game.releaseYear}</span>
                                    <span>•</span>
                                    <span className="text-emerald-500 font-medium">★ {game.rating}</span>
                                </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4">
                                <button className="text-zinc-500 hover:text-white transition-colors text-sm">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
