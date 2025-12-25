import Link from 'next/link';
import { Star, Calendar, Globe, User } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Mock Data for a single game
const GAME_DATA = {
    id: 1,
    title: "Elden Ring",
    description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
    backdropImage: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6ihj.jpg",
    releaseDate: "Feb 25, 2022",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    genres: ["RPG", "Adventure"],
    platforms: ["PC", "PS5", "PS4", "Xbox Series X/S", "Xbox One"],
    rating: 4.8,
    reviews: [
        { id: 1, user: "MaleniaBlade", rating: 5, text: "I am Malenia, blade of Miquella, and I have never known defeat. Also this game is good.", date: "Feb 28, 2022" },
        { id: 2, user: "LetMeSoloHer", rating: 5, text: "Good pot.", date: "Mar 15, 2022" },
        { id: 3, user: "CasualGamer", rating: 4, text: "Too hard but beautiful world.", date: "Mar 01, 2022" },
    ]
};

export default function GameDetails({ params }) {
    // In a real app, we would fetch data based on params.id
    const game = GAME_DATA;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            {/* Backdrop */}
            <div className="relative h-[40vh] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent z-10"></div>
                <img
                    src={game.backdropImage}
                    alt={game.title}
                    className="w-full h-full object-cover opacity-50"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Image */}
                    <div className="flex-shrink-0 mx-auto md:mx-0 w-64 rounded-lg shadow-2xl overflow-hidden border border-zinc-800">
                        <img src={game.coverImage} alt={game.title} className="w-full h-auto" />
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 text-center md:text-left pt-4 md:pt-32">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{game.title}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400 mb-6">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {game.releaseDate}</span>
                            <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {game.developer}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                            <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                                <Star className="w-5 h-5 text-emerald-500 fill-current" />
                                <span className="text-xl font-bold text-white">{game.rating}</span>
                                <span className="text-zinc-500 text-sm">/ 5</span>
                            </div>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                Log or Review
                            </button>
                            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-zinc-700">
                                Add to List
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                            <p className="text-zinc-300 leading-relaxed">{game.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 mb-1">Genres</h4>
                                <div className="flex flex-wrap gap-2">
                                    {game.genres.map(g => (
                                        <span key={g} className="bg-zinc-900 text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-800">{g}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 mb-1">Platforms</h4>
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms.map(p => (
                                        <span key={p} className="bg-zinc-900 text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-800">{p}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Recent Reviews</h3>
                            <div className="space-y-4">
                                {game.reviews.map(review => (
                                    <div key={review.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <span className="font-medium text-white">{review.user}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-bold">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-zinc-300 text-sm">{review.text}</p>
                                        <p className="text-zinc-600 text-xs mt-2">{review.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
