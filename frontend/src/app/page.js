'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Star, Heart, MessageCircle, Loader2, Sparkles, Gamepad2, Activity, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const [popularGames, setPopularGames] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [popularLists, setPopularLists] = useState([]);
    const [topReviewers, setTopReviewers] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [stats, setStats] = useState({ games: 0, reviews: 0, members: 0, lists: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gamesRes, listsRes, membersRes, reviewsRes, statsRes] = await Promise.all([
                    api.get('/games', { params: { page_size: 6, dates: '2025-01-01,2025-12-31' } }),
                    api.get('/lists/discover?sort=popular&limit=3'),
                    api.get('/users?limit=3&sort=reviews'),
                    api.get('/reviews/recent?limit=5'),
                    api.get('/stats')
                ]);
                const games = gamesRes.data.results || gamesRes.data || [];
                setPopularGames(games);
                setNewReleases(games.slice(0, 3));
                setPopularLists(listsRes.data.lists || []);
                setTopReviewers(membersRes.data.members || []);
                setRecentReviews(reviewsRes.data || []);
                setStats(statsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch home data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            <Navbar />

            {/* Global Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-100px] w-[500px] h-[500px] bg-lime-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-100px] left-[20%] w-[800px] h-[600px] bg-zinc-900/20 rounded-full blur-[120px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-8 px-6 lg:px-12 z-10 overflow-hidden">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0 select-none pb-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10"></div>
                    <img
                        src="/clair.jpg"
                        alt="Clair Obscur Atmosphere"
                        className="w-full h-full object-cover opacity-80 object-center"
                    />
                </div>

                <div className="max-w-7xl mx-auto relative z-20">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-xs font-bold uppercase tracking-widest text-lime-400 mb-8 animate-fade-in-up">
                            <Sparkles className="w-3 h-3" /> The Social Network for Gamers
                        </div>

                        <h1 className="animate-fade-in-up stagger-1 text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500">
                            TRACK YOUR<br />
                            <span className="text-glow animate-pulse-slow">VIRTUAL LIFE</span>
                        </h1>

                        <p className="animate-fade-in-up stagger-2 text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
                            Log every boss defeated, rate every narrative, and build the ultimate archive of your gaming history. Join a community of pixel purists.
                        </p>

                        <div className="animate-fade-in-up stagger-3 flex flex-wrap justify-center gap-4">
                            {!user ? (
                                <Link
                                    href="/signup"
                                    className="bg-lime-500 hover:bg-lime-400 text-black px-8 py-4 rounded-xl font-black uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_40px_rgba(132,204,22,0.5)] transform hover:-translate-y-1"
                                >
                                    Start Logging
                                </Link>
                            ) : (
                                <Link
                                    href="/profile"
                                    className="bg-lime-500 hover:bg-lime-400 text-black px-8 py-4 rounded-xl font-black uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_40px_rgba(132,204,22,0.5)] transform hover:-translate-y-1"
                                >
                                    My Profile
                                </Link>
                            )}
                            <Link
                                href="/games"
                                className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800/80 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all border border-white/10 hover:border-white/20"
                            >
                                <Play className="w-4 h-4 fill-current" /> How It Works
                            </Link>
                        </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="mt-20 animate-fade-in-up stagger-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {[
                                { label: 'Games Logged', value: stats.games, color: 'text-lime-400' },
                                { label: 'Reviews', value: stats.reviews, color: 'text-white' },
                                { label: 'Lists Created', value: stats.lists, color: 'text-lime-400' },
                                { label: 'Active Members', value: stats.members, color: 'text-white' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-zinc-900/30 backdrop-blur border border-white/5 p-6 rounded-2xl text-center group hover:border-lime-500/20 transition-colors">
                                    <div className={`text-3xl font-black ${stat.color} mb-1 group-hover:scale-110 transition-transform`}>
                                        {stat.value.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section className="pt-10 pb-20 px-6 lg:px-12 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 text-lime-500 text-xs font-bold uppercase tracking-wider mb-2">
                                <Activity className="w-4 h-4" /> Trending Now
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">POPULAR THIS WEEK</h2>
                        </div>
                        <Link href="/games" className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors">
                            VIEW ALL GAMES <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                            {popularGames.map(game => (
                                <GameCard key={game._id || game.igdbId} game={game} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Community Feed */}
            <section className="py-20 px-6 lg:px-12 bg-zinc-900/20 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Main Feed */}
                        <div className="lg:col-span-8">
                            <div className="flex items-center gap-2 mb-8">
                                <MessageCircle className="w-6 h-6 text-lime-400" />
                                <h2 className="text-2xl font-black text-white italic tracking-tighter">JUST REVIEWED</h2>
                            </div>

                            <div className="space-y-4">
                                {recentReviews.length > 0 ? recentReviews.map((review) => (
                                    <div key={review._id} className="group flex gap-5 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-lime-500/30 transition-all hover:bg-zinc-900/60">
                                        <Link href={`/games/${review.game?._id || review.game?.igdbId}`} className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden relative shadow-lg">
                                            {review.game?.coverImage ? (
                                                <img src={review.game.coverImage} alt={review.game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                    <Gamepad2 className="w-8 h-8 text-zinc-700" />
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <Link href={`/games/${review.game?._id || review.game?.igdbId}`}>
                                                    <h3 className="text-xl font-bold text-white hover:text-lime-400 transition-colors truncate">{review.game?.title}</h3>
                                                </Link>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-lime-400 fill-lime-400' : 'text-zinc-700'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                                                    {review.user?.profilePicture ? (
                                                        <img src={review.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[10px] font-bold text-zinc-500">
                                                            {review.user?.username?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-zinc-300">{review.user?.username}</span>
                                                <span className="text-zinc-600 text-xs">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {review.text && (
                                                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-3">"{review.text}"</p>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 group-hover:text-lime-400 transition-colors">
                                                    <Heart className="w-3.5 h-3.5" /> {review.likesCount || 0} Likes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/20 rounded-2xl border border-white/5 border-dashed">
                                        No reviews yet. Be the first!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-10">
                            {/* Popular Lists */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <Trophy className="w-5 h-5 text-lime-400" />
                                    <h3 className="text-lg font-black text-white italic tracking-tighter">POPULAR LISTS</h3>
                                </div>
                                <div className="space-y-4">
                                    {popularLists.map(list => (
                                        <Link key={list._id} href={`/lists/${list._id}`} className="group block p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-lime-500/30 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-bold text-white group-hover:text-lime-400 transition-colors truncate pr-4">{list.name}</div>
                                                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-zinc-400">{list.gameCount} Games</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {list.previewGames?.slice(0, 4).map((game, i) => (
                                                    <div key={i} className="w-10 h-14 bg-zinc-800 rounded-sm overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                                                        {game.coverImage && <img src={game.coverImage} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Community Stars */}
                            <div>
                                <h3 className="text-lg font-black text-white italic tracking-tighter mb-6">TOP REVIEWERS</h3>
                                <div className="space-y-3">
                                    {topReviewers.map((reviewer, i) => (
                                        <Link key={reviewer._id} href={`/users/${reviewer.username}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-lime-400 transition-colors">
                                                    {reviewer.profilePicture ? (
                                                        <img src={reviewer.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                                                            {reviewer.username?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-[10px] font-bold text-white">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-lime-400 transition-colors">{reviewer.username}</div>
                                                <div className="text-xs text-zinc-500 font-bold uppercase">{reviewer.stats?.reviews || 0} Reviews</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            {!user && (
                <section className="py-24 px-6 text-center border-t border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-lime-500/5 z-0" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-6">Ready to Join the Crew?</h2>
                        <p className="text-zinc-400 text-lg mb-10">Start building your legacy today. It's free, forever.</p>
                        <Link
                            href="/signup"
                            className="inline-block bg-white text-black hover:bg-lime-400 px-10 py-4 rounded-xl font-black uppercase tracking-wide transition-colors shadow-2xl"
                        >
                            Create Account
                        </Link>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}
