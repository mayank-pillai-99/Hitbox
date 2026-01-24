'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Lock, Image as ImageIcon, Loader2, Save, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

export default function Settings() {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        profilePicture: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.put('/auth/me', formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
            setSaving(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
            <Navbar />

            <main className="flex-grow relative px-4 py-20 flex items-center justify-center overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-2xl relative z-10">
                    <div className="mb-8 text-center animate-fade-in-up">
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">PROFILE SETTINGS</h1>
                        <p className="text-zinc-400">Customize your Hitbox identity</p>
                    </div>

                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in-up stagger-1">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-lime-500/10 border border-lime-500/20 text-lime-400 rounded-xl text-sm flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                                {success}
                            </div>
                        )}

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-black/20 rounded-xl border border-white/5">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center group-hover:border-lime-400 transition-colors duration-300">
                                        {formData.profilePicture ? (
                                            <img src={formData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-zinc-500 group-hover:text-lime-400 transition-colors" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 w-full relative">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Profile Picture URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ImageIcon className="h-4 w-4 text-zinc-600" />
                                        </div>
                                        <input
                                            type="text"
                                            id="profilePicture"
                                            value={formData.profilePicture}
                                            onChange={handleChange}
                                            placeholder="https://imgur.com/..."
                                            className="block w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all font-mono"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500">Paste a direct image link (JPEG, PNG, GIF)</p>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {/* Username */}
                                <div>
                                    <label htmlFor="username" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-zinc-600" />
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all font-bold tracking-tight"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-zinc-600" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label htmlFor="bio" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bio</label>
                                    <textarea
                                        id="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about your gaming history..."
                                        className="block w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all resize-none leading-relaxed"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 text-zinc-400 hover:text-white font-bold text-sm transition-colors uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 bg-lime-400 hover:bg-lime-300 text-black font-black rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 uppercase tracking-wide text-sm shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
