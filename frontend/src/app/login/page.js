'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
    const { login } = useAuth();
    const next = useSearchParams().get('next');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password, next);
        } catch (err) {
            setError(!err.response
                ? 'Could not reach the server. Please try again.'
                : err.response.status === 400
                    ? 'Invalid email or password. Please try again.'
                    : err.response.data?.message || 'Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in-up">
            <p className="label text-neon">Welcome back</p>
            <h1 className="display text-5xl mt-2">Log in</h1>
            <p className="mt-3 text-muted">Sign in to continue your logbook.</p>

            <form onSubmit={handleSubmit} className="panel brackets p-6 mt-8 space-y-5">
                {error && (
                    <p role="alert" className="border border-hot text-hot px-4 py-3 text-sm">{error}</p>
                )}

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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="field"
                    />
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <>Log in <ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
                </button>
            </form>

            <p className="mt-6 text-center text-muted">
                New here?{' '}
                <Link href="/signup" className="font-bold text-neon hover:underline">Create an account</Link>
            </p>
        </div>
    );
}

export default function Login() {
    return (
        <PageShell>
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </PageShell>
    );
}
