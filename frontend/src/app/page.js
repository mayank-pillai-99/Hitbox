'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Star, Heart, MessageCircle, Loader2 } from 'lucide-react';
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
                    api.get('/lists/discover?sort=popular&limit=2'),
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

                // Set stats from dedicated API
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
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative px-6 lg:px-12 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Text */}
                        <div>
                            <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none mb-6">
                                TRACK YOUR<br />
                                <span className="text-lime-400">VIRTUAL LIFE.</span>
                            </h1>
                            <p className="animate-fade-in-up stagger-2 text-base sm:text-lg text-zinc-400 max-w-md mb-8">
                                The social network for pixel purists. Log every boss defeated, rate every narrative, and build the ultimate archive of your gaming history.
                            </p>
                            <div className="flex flex-wrap gap-4 mb-12">
                                {!user ? (
                                    <Link
                                        href="/signup"
                                        className="bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded font-bold uppercase tracking-wide transition-colors"
                                    >
                                        Start Logging
                                    </Link>
                                ) : (
                                    <Link
                                        href="/profile"
                                        className="bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded font-bold uppercase tracking-wide transition-colors"
                                    >
                                        My Profile
                                    </Link>
                                )}
                                <Link
                                    href="/games"
                                    className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded font-bold uppercase tracking-wide transition-colors border border-zinc-800"
                                >
                                    <Play className="w-4 h-4" /> How It Works
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 sm:gap-12">
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">{stats.reviews.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews Logged</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">{stats.lists.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Lists Created</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">{stats.members.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Active Players</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Glassmorphism Stats Dashboard */}
                        <div className="relative hidden lg:block">
                            <div className="relative w-full max-w-md">
                                {/* Background Glow Effects */}
                                <div className="absolute -top-10 -right-10 w-72 h-72 bg-lime-500/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

                                {/* Main Stats Card */}
                                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                                            <span className="text-xs text-zinc-400 uppercase tracking-wider">Live Activity</span>
                                        </div>
                                        <div className="text-xs text-zinc-500">Updated just now</div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-lime-500/30 transition-colors">
                                            <div className="text-3xl font-black text-lime-400 mb-1">{stats.games.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">Games Tracked</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-colors">
                                            <div className="text-3xl font-black text-white mb-1">{stats.reviews.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">Total Reviews</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors">
                                            <div className="text-3xl font-black text-purple-400 mb-1">{stats.members.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">Community</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-amber-500/30 transition-colors">
                                            <div className="text-3xl font-black text-amber-400 mb-1">{stats.lists.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">Curated Lists</div>
                                        </div>
                                    </div>

                                    {/* Trending Game */}
                                    {popularGames.length > 0 && (
                                        <Link href={`/games/${popularGames[0]._id || popularGames[0].id}`} className="block bg-gradient-to-r from-lime-500/10 to-transparent rounded-xl p-4 border border-lime-500/20 hover:border-lime-500/40 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                                    {popularGames[0].coverImage && (
                                                        <img src={popularGames[0].coverImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-lime-400 font-medium mb-1">🔥 Trending Now</div>
                                                    <div className="text-white font-bold truncate group-hover:text-lime-400 transition-colors">{popularGames[0].title}</div>
                                                    <div className="text-xs text-zinc-400">Most played this week</div>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>

                                {/* Floating Mini Card */}
                                <div className="absolute -top-4 -right-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-2 shadow-xl animate-fade-in-up stagger-2">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-lime-400 fill-lime-400" />
                                        <span className="text-sm font-bold text-white">4.8</span>
                                        <span className="text-xs text-zinc-400">avg rating</span>
                                    </div>
                                </div>

                                {/* Floating Activity Indicator */}
                                <div className="absolute -bottom-3 -left-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-3 py-2 shadow-xl animate-fade-in-up stagger-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-xs text-zinc-300">{stats.members} active members</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular This Week */}
            <section className="px-6 lg:px-12 py-12 border-t border-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="text-lime-400 text-xs font-bold uppercase tracking-wider mb-1">Trend Report</div>
                            <h2 className="text-2xl font-black text-white">Popular This Week</h2>
                        </div>
                        <Link href="/games" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors">
                            Browse All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {popularGames.map(game => (
                                <GameCard key={game._id || game.igdbId} game={game} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Just Reviewed + Sidebar */}
            <section className="px-6 lg:px-12 py-12 border-t border-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Just Reviewed */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-black text-white mb-6">Just Reviewed</h2>

                            {/* Review Cards */}
                            <div className="space-y-6">
                                {recentReviews.length > 0 ? recentReviews.map((review) => (
                                    <div key={review._id} className="card-hover flex gap-4 group p-3 rounded-lg bg-zinc-900/30 border border-transparent hover:border-zinc-800">
                                        <Link
                                            href={`/games/${review.game?._id || review.game?.igdbId}`}
                                            className="img-hover-zoom w-16 h-24 bg-zinc-800 rounded overflow-hidden flex-shrink-0"
                                        >
                                            {review.game?.coverImage ? (
                                                <img src={review.game.coverImage} alt={review.game.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                                            )}
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <Link
                                                    href={`/games/${review.game?._id || review.game?.igdbId}`}
                                                    className="font-bold text-white hover:text-lime-400 transition-colors"
                                                >
                                                    {review.game?.title || 'Unknown Game'}
                                                </Link>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-lime-400 fill-lime-400' : 'text-zinc-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {review.user?.profilePicture ? (
                                                    <img src={review.user.profilePicture} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-lime-500" />
                                                )}
                                                <span className="text-sm text-zinc-400">{review.user?.username || 'Anonymous'}</span>
                                                <span className="text-xs text-zinc-600">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {review.text && <p className="text-sm text-zinc-400 line-clamp-2 mb-2">{review.text}</p>}
                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                <Heart className="w-3.5 h-3.5" />
                                                <span>{review.likesCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-zinc-500">No reviews yet. Be the first to review a game!</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Popular Lists */}
                            <div>
                                <h3 className="text-lg font-black text-white mb-4">Popular Lists</h3>
                                <div className="space-y-4">
                                    {popularLists.length > 0 ? popularLists.map(list => (
                                        <Link key={list._id} href={`/lists/${list._id}`} className="card-hover glow-hover block group p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
                                            <div className="flex gap-1 mb-2 overflow-hidden rounded">
                                                {list.previewGames?.slice(0, 5).map((game, i) => (
                                                    <div key={i} className="w-12 h-16 bg-zinc-800 overflow-hidden">
                                                        {game.coverImage && <img src={game.coverImage} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-lime-400 transition-colors">{list.name}</div>
                                                    <div className="text-xs text-zinc-500">{list.gameCount} games</div>
                                                </div>
                                                <div className="text-xs text-zinc-600">by {list.user?.username}</div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <p className="text-zinc-500 text-sm">No lists yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Reviewers */}
                            <div>
                                <h3 className="text-lg font-black text-white mb-4">Top Reviewers</h3>
                                <div className="space-y-3">
                                    {topReviewers.length > 0 ? topReviewers.map(member => (
                                        <div key={member._id} className="card-hover flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/50">
                                            <Link href={`/users/${member.username}`} className="flex items-center gap-3 group">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden transition-transform group-hover:scale-105">
                                                    {member.profilePicture ? (
                                                        <img src={member.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white group-hover:text-lime-400 transition-colors">{member.username}</div>
                                                    <div className="text-xs text-zinc-500">{member.stats?.reviews || 0} reviews</div>
                                                </div>
                                            </Link>
                                            <button className="text-xs px-3 py-1 border border-zinc-700 rounded hover:border-lime-400 hover:text-lime-400 transition-colors">
                                                Follow
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-zinc-500 text-sm">No members yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join The Crew CTA */}
            {!user && (
                <section className="px-6 lg:px-12 py-20 border-t border-zinc-900">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">JOIN THE CREW</h2>
                        <p className="text-zinc-400 mb-8">
                            Create lists, share reviews, and follow your friends. It's free and always will be.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-block bg-lime-400 hover:bg-lime-300 text-black px-8 py-3 rounded font-bold transition-colors"
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
