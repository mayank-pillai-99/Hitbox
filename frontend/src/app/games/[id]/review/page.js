import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Star, X } from 'lucide-react';

export default function ReviewEditor({ params }) {
    // Mock game data
    const game = {
        id: params.id,
        title: "Elden Ring",
        coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg"
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-zinc-800 p-6 flex items-start justify-between">
                        <div className="flex gap-4">
                            <img src={game.coverImage} alt={game.title} className="w-16 h-24 object-cover rounded shadow-md" />
                            <div>
                                <h2 className="text-sm text-zinc-400 uppercase tracking-wider font-semibold">Reviewing</h2>
                                <h1 className="text-2xl font-bold text-white">{game.title}</h1>
                            </div>
                        </div>
                        <Link href={`/games/${game.id}`} className="text-zinc-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-8">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-3">Rating</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} className="group focus:outline-none">
                                        <Star className={`w-8 h-8 ${star <= 4 ? 'text-emerald-500 fill-current' : 'text-zinc-700 group-hover:text-zinc-600'} transition-colors`} />
                                    </button>
                                ))}
                                <span className="ml-4 text-xl font-bold text-white">4.0</span>
                            </div>
                        </div>

                        {/* Review Text */}
                        <div>
                            <label htmlFor="review" className="block text-sm font-medium text-zinc-300 mb-2">
                                Your Review
                            </label>
                            <textarea
                                id="review"
                                rows={6}
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                                placeholder="Write your thoughts on the game..."
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link href={`/games/${game.id}`} className="px-6 py-2 text-zinc-400 hover:text-white font-medium transition-colors">
                                Cancel
                            </Link>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg font-bold transition-colors">
                                Post Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
