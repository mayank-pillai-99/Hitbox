'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import api from '@/utils/api';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useToast } from '@/context/ToastContext';

export default function ListEditor() {
    const { ready } = useRequireAuth();
    const toast = useToast();
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!ready) return <PageShell><ProfileSkeleton /></PageShell>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            const { data } = await api.post('/lists', { name, description });
            toast.success('List created');
            router.push(`/lists/${data._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create list. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <PageShell>
            <div className="max-w-xl mx-auto animate-fade-in-up">
                <p className="label text-neon">New collection</p>
                <h1 className="display text-4xl sm:text-5xl mt-2">Create a list</h1>
                <p className="mt-3 text-muted">Curate your favourite games into a collection.</p>

                <form onSubmit={handleSubmit} className="panel brackets p-6 mt-8 space-y-5">
                    <div>
                        <label htmlFor="name" className="label block mb-1">List name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            className="field"
                            placeholder="e.g. Top 10 RPGs, Weekend vibes"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="label block mb-1">Description (optional)</label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            className="field resize-none"
                            placeholder="What makes this collection special?"
                        />
                    </div>

                    <p className="panel-accent bg-panel-2 p-3 text-sm text-muted">
                        You can add games from any game page after you create the list.
                    </p>

                    <div className="flex items-center justify-end gap-3">
                        <Link href="/lists" className="btn-ghost">Cancel</Link>
                        <button type="submit" disabled={submitting || !name.trim()} className="btn-primary">
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                            Create list
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>
    );
}
