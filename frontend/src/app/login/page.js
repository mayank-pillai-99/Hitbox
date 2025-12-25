import Link from 'next/link';

export default function Login() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 px-4">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-zinc-400">Sign in to your Hitbox account</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" class="block text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <Link href="#" class="text-xs text-emerald-500 hover:text-emerald-400">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 font-medium">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
