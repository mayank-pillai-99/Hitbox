'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Mail, Lock, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

export default function Settings() {
    const { user, login } = useAuth(); // We might need a way to refresh user, but for now we'll handle it manually or reload
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
        } else {
            // Wait a bit for auth to load, if still no user, maybe redirect (handled by Layout/Protection usually)
            // But here we rely on AuthContext. If AuthContext is done loading and no user, we might redirect.
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
            // Ideally update context user here. 
            // Since useAuth doesn't expose a setUser, we can force a reload or just assume it's okay for now.
            // A page reload is simple and effective to re-fetch "me".
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
            setSaving(false);
        }
    };

    if (!user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

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
                                <button disabled className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 rounded-lg text-sm font-medium cursor-not-allowed">
                                    <Lock className="w-4 h-4" /> Account (Coming Soon)
                                </button>
                                <button disabled className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 rounded-lg text-sm font-medium cursor-not-allowed">
                                    <ImageIcon className="w-4 h-4" /> Appearance (Coming Soon)
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

                            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">{error}</div>}
                            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm">{success}</div>}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Avatar */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Profile Picture URL</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center">
                                            {formData.profilePicture ? (
                                                <img src={formData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 text-zinc-500" />
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            id="profilePicture"
                                            value={formData.profilePicture}
                                            onChange={handleChange}
                                            placeholder="https://example.com/avatar.jpg"
                                            className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                                        />
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
                                            value={formData.username}
                                            onChange={handleChange}
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
                                        value={formData.bio}
                                        onChange={handleChange}
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
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-700 rounded-lg bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
