import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { User, Mail, Lock, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4">
                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium">
                                    <User className="w-4 h-4" /> Profile
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm font-medium transition-colors">
                                    <Lock className="w-4 h-4" /> Account
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm font-medium transition-colors">
                                    <ImageIcon className="w-4 h-4" /> Appearance
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

                            <form className="space-y-6">
                                {/* Avatar */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Profile Picture</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700">
                                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <button type="button" className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
                                            Change Avatar
                                        </button>
                                    </div>
                                </div>

                                {/* Username */}
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-zinc-500" />
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            defaultValue="PixelPioneer"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-700 rounded-lg bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                                    <textarea
                                        id="bio"
                                        rows={4}
                                        defaultValue="RPG enthusiast and indie game lover."
                                        className="block w-full px-4 py-2.5 border border-zinc-700 rounded-lg bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                                    ></textarea>
                                    <p className="mt-1 text-xs text-zinc-500">Brief description for your profile.</p>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-zinc-500" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            defaultValue="user@example.com"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-700 rounded-lg bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
