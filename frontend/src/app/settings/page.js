'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import Avatar from '@/components/ui/Avatar';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import api from '@/utils/api';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Settings() {
    const { user, ready } = useRequireAuth();
    const { refreshUser } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ username: '', email: '', bio: '', profilePicture: '' });

    // Fill the form once the user loads. Adjusting state during render avoids the extra render an effect would cause.
    const [loadedUser, setLoadedUser] = useState(null);
    if (user && user !== loadedUser) {
        setLoadedUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            bio: user.bio || '',
            profilePicture: user.profilePicture || '',
        });
    }

    if (!ready) return <PageShell><ProfileSkeleton /></PageShell>;

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.put('/auth/me', formData);
            await refreshUser();
            toast.success('Profile updated');
            router.push('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            setSaving(false);
        }
    };

    return (
        <PageShell>
            <div className="max-w-2xl mx-auto animate-fade-in-up">
                <p className="label text-neon">Account</p>
                <h1 className="display text-4xl sm:text-5xl mt-2">Settings</h1>

                <form onSubmit={handleSubmit} className="panel brackets p-6 mt-8 space-y-5">
                    {error && <p role="alert" className="border border-hot text-hot px-4 py-3 text-sm">{error}</p>}

                    <div className="flex items-center gap-4">
                        <Avatar user={{ username: formData.username, profilePicture: formData.profilePicture }} size={72} label="Avatar preview" />
                        <p className="text-sm text-muted">Your picture is shown from the image link below.</p>
                    </div>

                    <div>
                        <label htmlFor="username" className="label block mb-1">Username</label>
                        <input id="username" type="text" value={formData.username} onChange={handleChange} required minLength={3} maxLength={30} pattern="[A-Za-z0-9_\-]+" title="Letters, numbers, underscores and hyphens" className="field" autoComplete="username" />
                    </div>
                    <div>
                        <label htmlFor="email" className="label block mb-1">Email</label>
                        <input id="email" type="email" value={formData.email} onChange={handleChange} required className="field" autoComplete="email" />
                    </div>
                    <div>
                        <label htmlFor="profilePicture" className="label block mb-1">Profile picture URL</label>
                        <input id="profilePicture" type="url" value={formData.profilePicture} onChange={handleChange} maxLength={500} placeholder="https://example.com/me.png" className="field" />
                    </div>
                    <div>
                        <label htmlFor="bio" className="label block mb-1">Bio</label>
                        <textarea id="bio" rows={4} value={formData.bio} onChange={handleChange} maxLength={500} className="field resize-none" />
                        <p className="label mt-1">{formData.bio.length} / 500</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/profile" className="btn-ghost">Cancel</Link>
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>
    );
}
