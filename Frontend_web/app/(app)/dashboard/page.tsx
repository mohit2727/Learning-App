'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useUser();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [dashboard, setDashboard] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        const load = async () => {
            try {
                const token = await getToken();
                setAuthToken(token);
                const [d, a] = await Promise.all([dataService.getDashboard(), dataService.getAnnouncements()]);
                setDashboard(d);
                setAnnouncements(a);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [isLoaded, isSignedIn]);

    useEffect(() => {
        if (!announcements.length) return;
        const t = setInterval(() => setCurrent(c => (c + 1) % announcements.length), 4000);
        return () => clearInterval(t);
    }, [announcements.length]);

    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const ann = announcements[current];

    return (
        <div className="flex flex-col bg-gray-50 min-h-full">
            {/* Header */}
            <div className="bg-blue-600 pt-12 pb-8 px-5 rounded-b-3xl">
                <p className="text-blue-200 text-sm">Hello 👋</p>
                <h1 className="text-white text-2xl font-bold">{displayName}</h1>
                <p className="text-blue-200 text-sm mt-0.5">Keep pushing your preparation!</p>
            </div>

            {/* Announcement Banner */}
            {ann && (
                <div className="mx-4 -mt-4 rounded-2xl overflow-hidden shadow-md bg-white">
                    {ann.image
                        ? <div className="relative h-36"><img src={ann.image} alt={ann.title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end"><p className="text-white/80 text-xs uppercase tracking-wider">Announcement</p><p className="text-white font-bold text-base truncate">{ann.title}</p><p className="text-white/90 text-xs line-clamp-2">{ann.body}</p></div></div>
                        : <div className="bg-blue-600 p-4"><p className="text-blue-200 text-xs uppercase tracking-wider mb-0.5">Announcement</p><p className="text-white font-bold text-base truncate">{ann.title}</p><p className="text-blue-100 text-xs line-clamp-2">{ann.body}</p></div>
                    }
                </div>
            )}

            <div className="px-4 pt-5 space-y-5 pb-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-bold text-blue-600">{dashboard?.stats?.courses || 0}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Total Courses</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-bold text-purple-600">{dashboard?.stats?.enrolled || 0}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Enrolled</p>
                    </div>
                </div>

                {/* Newest Courses */}
                {dashboard?.newestCourses?.length > 0 && (
                    <div>
                        <h2 className="font-bold text-gray-800 mb-3">✨ Video Playlists</h2>
                        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                            {dashboard.newestCourses.map((c: any) => (
                                <Link key={c._id} href={`/courses/${c._id}`} className="flex-shrink-0 w-40 bg-blue-600 rounded-2xl overflow-hidden shadow-md">
                                    {c.image ? <img src={c.image} alt={c.title} className="w-full h-24 object-cover" /> : <div className="h-24 bg-blue-700 flex items-center justify-center text-4xl">📚</div>}
                                    <div className="p-3">
                                        <p className="text-white font-bold text-sm truncate">{c.title}</p>
                                        <p className="text-blue-200 text-xs">{c.lessons?.length || 0} Videos</p>
                                        <div className="mt-2 bg-white/20 rounded-lg py-1 text-center text-white text-[10px] font-bold uppercase tracking-wider">View Playlist</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Access */}
                <div>
                    <h2 className="font-bold text-gray-800 mb-3">🚀 Quick Access</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: '📚', label: 'Courses', href: '/courses', bg: 'bg-green-100' },
                            { icon: '📝', label: 'Quizzes', href: '/tests', bg: 'bg-orange-100' },
                            { icon: '🏆', label: 'Leaderboard', href: '/leaderboard', bg: 'bg-yellow-100' },
                            { icon: '👤', label: 'Profile', href: '/profile', bg: 'bg-pink-100' },
                        ].map(tile => (
                            <Link key={tile.label} href={tile.href} className={`${tile.bg} rounded-2xl flex flex-col items-center justify-center p-5 gap-1`}>
                                <span className="text-3xl">{tile.icon}</span>
                                <span className="text-gray-700 text-xs font-semibold">{tile.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Community */}
                <div>
                    <h2 className="font-bold text-gray-800 mb-3">📲 Join Community</h2>
                    <div className="flex gap-3">
                        <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="flex-1 bg-green-500 rounded-xl py-3 text-white font-bold text-center text-sm">💬 WhatsApp</a>
                        <a href="https://t.me/" target="_blank" rel="noreferrer" className="flex-1 bg-sky-500 rounded-xl py-3 text-white font-bold text-center text-sm">✈️ Telegram</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
