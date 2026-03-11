'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import Link from 'next/link';
import { TrendingUp, Target, Sparkles, MessageCircle, Send } from 'lucide-react';

export default function DashboardPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const [dashboard, setDashboard] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (authLoading || !user) return;
        const load = async () => {
            try {
                // The global interceptor should handle token updates, but 
                // we can also force token setting here if needed
                const token = await user.getIdToken();
                setAuthToken(token);

                const [d, a] = await Promise.all([dataService.getDashboard(), dataService.getAnnouncements()]);
                setDashboard(d);
                setAnnouncements(a);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [authLoading, user]);

    useEffect(() => {
        if (!announcements.length) return;
        const t = setInterval(() => setCurrent(c => (c + 1) % announcements.length), 4000);
        return () => clearInterval(t);
    }, [announcements.length]);

    const displayName = dbUser?.name || 'Student';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'S';

    if (loading || authLoading) return (
        <div className="flex-1 flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Loading...</p>
            </div>
        </div>
    );

    const ann = announcements[current];

    return (
        <div className="flex flex-col bg-gray-50 min-h-full">

            {/* Gradient Header */}
            <div className="grad-header mb-2">
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                        <p className="text-violet-200 text-xs font-medium tracking-wide uppercase">Hello 👋</p>
                        <h1 className="text-white text-xl font-bold mt-0.5">{displayName}</h1>
                        <p className="text-violet-200 text-xs mt-0.5">Ready to learn something new?</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{initials}</span>
                    </div>
                </div>

                {/* Stats row inside header */}
                <div className="grid grid-cols-2 gap-2 relative z-10">
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                                <TrendingUp size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-black text-lg leading-none">{dashboard?.stats?.enrolled || 0}</p>
                                <p className="text-violet-200 text-[10px] font-medium">Enrolled Courses</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                                <Target size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-black text-lg leading-none">{dashboard?.stats?.quizzesTaken || 0}</p>
                                <p className="text-violet-200 text-[10px] font-medium">Quizzes Taken</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Announcement Banner */}
            {ann && (
                <div className="mx-4 mb-4 rounded-2xl overflow-hidden shadow-md">
                    {ann.image ? (
                        <div className="relative h-32">
                            <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 flex flex-col justify-end">
                                <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">📢 Announcement</span>
                                <p className="text-white font-bold text-sm truncate">{ann.title}</p>
                                <p className="text-white/80 text-xs line-clamp-1">{ann.body}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-violet-600 to-purple-500 p-4">
                            <span className="text-[10px] text-violet-200 font-semibold uppercase tracking-wider">📢 Announcement</span>
                            <p className="text-white font-bold text-sm mt-0.5">{ann.title}</p>
                            <p className="text-violet-100 text-xs mt-0.5 line-clamp-2">{ann.body}</p>
                        </div>
                    )}
                    {announcements.length > 1 && (
                        <div className="flex gap-1 justify-center py-1.5 bg-white">
                            {announcements.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all ${i === current ? 'w-4 bg-violet-500' : 'w-1 bg-gray-200'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="px-4 space-y-4 pb-6">
                {/* Newest Courses */}
                {dashboard?.newestCourses?.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-violet-500" />
                            <h2 className="font-bold text-gray-800 text-sm">Video Playlists</h2>
                            <Link href="/courses" className="ml-auto text-violet-600 text-xs font-semibold">See all →</Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                            {dashboard.newestCourses.map((c: any) => (
                                <Link key={c._id} href={`/courses/${c._id}`}
                                    className="flex-shrink-0 w-36 rounded-2xl overflow-hidden shadow-md card-hover bg-white border border-gray-100">
                                    {c.image
                                        ? <img src={c.image} alt={c.title} className="w-full h-20 object-cover" />
                                        : <div className="h-20 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl">📚</div>}
                                    <div className="p-2.5">
                                        <p className="text-gray-800 font-bold text-xs truncate">{c.title}</p>
                                        <p className="text-gray-400 text-[10px] mt-0.5">{c.lessons?.length || 0} videos</p>
                                        <div className="mt-1.5 bg-violet-50 rounded-lg py-1 text-center text-violet-600 text-[9px] font-bold uppercase tracking-wider">Watch →</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Access */}
                <div>
                    <h2 className="font-bold text-gray-800 text-sm mb-3">🚀 Quick Access</h2>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { icon: '📚', label: 'Courses', href: '/courses', bg: 'from-emerald-400 to-teal-500' },
                            { icon: '📝', label: 'Quizzes', href: '/tests', bg: 'from-orange-400 to-rose-500' },
                            { icon: '🏆', label: 'Ranks', href: '/leaderboard', bg: 'from-amber-400 to-yellow-500' },
                            { icon: '👤', label: 'Profile', href: '/profile', bg: 'from-blue-400 to-indigo-500' },
                        ].map(tile => (
                            <Link key={tile.label} href={tile.href}
                                className={`bg-gradient-to-br ${tile.bg} rounded-2xl flex flex-col items-center justify-center py-3 px-1 gap-1 card-hover shadow-sm`}>
                                <span className="text-2xl">{tile.icon}</span>
                                <span className="text-white text-[9px] font-bold">{tile.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Community */}
                <div>
                    <h2 className="font-bold text-gray-800 text-sm mb-3">📲 Join Community</h2>
                    <div className="flex gap-3">
                        <a href="https://whatsapp.com" target="_blank" rel="noreferrer"
                            className="flex-1 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl py-3 flex items-center justify-center gap-2 card-hover shadow-sm">
                            <MessageCircle size={16} className="text-white" />
                            <span className="text-white font-bold text-xs">WhatsApp</span>
                        </a>
                        <a href="https://t.me/" target="_blank" rel="noreferrer"
                            className="flex-1 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl py-3 flex items-center justify-center gap-2 card-hover shadow-sm">
                            <Send size={16} className="text-white" />
                            <span className="text-white font-bold text-xs">Telegram</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
