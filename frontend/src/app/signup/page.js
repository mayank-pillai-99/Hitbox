'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
    const { signup } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signup(username, email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <PageShell>
            <div className="max-w-md mx-auto animate-fade-in-up">
                <p className="label text-neon">Join Hitbox</p>
                <h1 className="display text-5xl mt-2">Sign up</h1>
                <p className="mt-3 text-muted">Start tracking, reviewing and sharing the games you play.</p>

                <form onSubmit={handleSubmit} className="panel brackets p-6 mt-8 space-y-5">
                    {error && (
                        <p role="alert" className="border border-hot text-hot px-4 py-3 text-sm">{error}</p>
                    )}

                    <div>
                        <label htmlFor="username" className="label block mb-1">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                            pattern="[A-Za-z0-9_\-]+"
                            title="Letters, numbers, underscores and hyphens"
                            aria-describedby="username-hint"
                            className="field"
                        />
                        <p id="username-hint" className="label mt-1">3-30 letters, numbers, _ or -</p>
                    </div>
                    <div>
                        <label htmlFor="email" className="label block mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="field"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="label block mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            maxLength={72}
                            aria-describedby="password-hint"
                            className="field"
                        />
                        <p id="password-hint" className="label mt-1">At least 8 characters</p>
                    </div>

                    <button type="submit" disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <>Create account <ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
                    </button>
                </form>

                <p className="mt-6 text-center text-muted">
                    Already a member?{' '}
                    <Link href="/login" className="font-bold text-neon hover:underline">Log in</Link>
                </p>
            </div>
        </PageShell>
    );
}
