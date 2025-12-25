import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { X, Plus, Search } from 'lucide-react';

export default function ListEditor() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">Create New List</h1>
                        <Link href="/profile" className="text-zinc-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-8">
                        {/* List Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                                List Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="e.g., Top 10 RPGs of All Time"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                                Description <span className="text-zinc-500 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                                placeholder="What is this list about?"
                            ></textarea>
                        </div>

                        {/* Add Games */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Add Games
                            </label>
                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg bg-zinc-950 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="Search for a game to add..."
                                />
                            </div>

                            {/* Added Games List (Mock) */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500 font-mono w-6 text-center">1</span>
                                        <img src="https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg" alt="Elden Ring" className="w-8 h-12 object-cover rounded" />
                                        <span className="text-white font-medium">Elden Ring</span>
                                    </div>
                                    <button className="text-zinc-500 hover:text-red-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500 font-mono w-6 text-center">2</span>
                                        <img src="https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg" alt="Baldur's Gate 3" className="w-8 h-12 object-cover rounded" />
                                        <span className="text-white font-medium">Baldur's Gate 3</span>
                                    </div>
                                    <button className="text-zinc-500 hover:text-red-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800">
                            <Link href="/profile" className="px-6 py-2 text-zinc-400 hover:text-white font-medium transition-colors">
                                Cancel
                            </Link>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg font-bold transition-colors">
                                Save List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
