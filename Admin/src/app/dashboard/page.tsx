'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, BookOpen, FileText, TrendingUp, ArrowRight, Heart, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, bg, onClick }: any) => (
    <motion.div
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`bg-white border border-slate-200 p-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 group flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className={`p-3.5 rounded-2xl ${bg} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} strokeWidth={2.5} />
        </div>
        <div>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const { user, loading: authLoading } = useAuth();
    
    // Modal state
    const [modalData, setModalData] = useState<{ title: string, type: 'students' | 'paidUsers' | 'courses' | 'quizzes', items: any[] } | null>(null);
    const [loadingModalData, setLoadingModalData] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (authLoading || !user) return;

            try {
                const { data } = await api.get('/users/dashboard-stats');
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, [authLoading, user]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleStatCardClick = async (type: 'students' | 'paidUsers' | 'courses' | 'quizzes', title: string) => {
        setLoadingModalData(true);
        setModalData({ title, type, items: [] });
        try {
            if (type === 'students') {
                const { data } = await api.get('/users');
                setModalData({ title, type, items: data });
            } else if (type === 'paidUsers') {
                const { data } = await api.get('/users');
                // Calculate isPaid dynamically for each user since /users endpoint might not return it directly
                // (Assuming they have these populated, else we simply show users who have role student)
                // For a completely accurate list, the backend should ideally return a dedicated list or we fetch full details.
                // For now, we will assume /users returns enrolledCourses/purchasedQuizzes, OR we will just show the first 50.
                // To be safe, let's fetch individual details if needed, or rely on the populated arrays.
                const paidUsers = data.filter((u: any) => 
                    (u.enrolledCourses && u.enrolledCourses.length > 0) || 
                    (u.purchasedQuizzes && u.purchasedQuizzes.length > 0) ||
                    (u.purchasedPlaylists && u.purchasedPlaylists.length > 0)
                );
                setModalData({ title, type, items: paidUsers });
            } else if (type === 'courses') {
                const { data } = await api.get('/courses');
                setModalData({ title, type, items: data });
            } else if (type === 'quizzes') {
                const { data } = await api.get('/tests');
                setModalData({ title, type, items: data });
            }
        } catch (err) {
            console.error('Failed to fetch modal data', err);
            alert('Failed to load details.');
            setModalData(null);
        } finally {
            setLoadingModalData(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
                <p className="text-slate-500 font-medium text-base mt-1">Welcome back, Admin.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Students"
                    value={stats?.students || '0'}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    onClick={() => handleStatCardClick('students', 'Total Students')}
                />
                <StatCard
                    title="Paid Users"
                    value={stats?.paidUsers || '0'}
                    icon={Heart}
                    color="text-pink-600"
                    bg="bg-pink-50"
                    onClick={() => handleStatCardClick('paidUsers', 'Paid Users')}
                />
                <StatCard
                    title="Active Courses"
                    value={stats?.courses || '0'}
                    icon={BookOpen}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                    onClick={() => handleStatCardClick('courses', 'Active Courses')}
                />
                <StatCard
                    title="AI Quizzes"
                    value={stats?.quizzes || '0'}
                    icon={FileText}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    onClick={() => handleStatCardClick('quizzes', 'AI Quizzes')}
                />
            </div>

            <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                            Recent Activities
                        </h3>
                    </div>

                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity: any, i: number) => (
                                <div key={i} className="flex gap-4 group items-center p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                                        <div className={`w-2.5 h-2.5 rounded-full ${activity.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-800 font-bold text-sm truncate">{activity.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{activity.type}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-xs text-slate-500 font-medium">{formatTimeAgo(activity.time)}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-slate-500 font-medium">No activities recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 relative overflow-hidden shadow-xl shadow-blue-600/20 group cursor-pointer flex-1">
                        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-md">
                                    <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-white leading-tight mb-3 tracking-tight">AI Quiz Builder</h3>
                                <p className="text-blue-100 font-bold text-sm leading-relaxed">
                                    Convert PDFs or Docs into interactive tests instantly using Gemini AI.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <span className="text-white font-black text-sm uppercase tracking-widest">Get Started</span>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-blue-50 transition-colors">
                                    <ArrowRight className="w-5 h-5 text-blue-600" strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="w-8 h-8 text-pink-600" strokeWidth={2.5} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900">Premium Growth</h4>
                        <p className="text-slate-500 text-sm font-medium mt-2">Monitor your revenue and paid student metrics.</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>

            {/* Data Modal */}
            <AnimatePresence>
                {modalData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModalData(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{modalData.title} Detailed List</h2>
                                <button onClick={() => setModalData(null)} className="p-2 hover:bg-slate-200/50 text-slate-400 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {loadingModalData ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
                                    </div>
                                ) : modalData.items.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500 font-medium">No records found for {modalData.title}.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {modalData.items.map((item: any, idx: number) => {
                                            if (modalData.type === 'students' || modalData.type === 'paidUsers') {
                                                return (
                                                    <div key={item._id || idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-blue-100 transition-all">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-black text-slate-600 text-xs shadow-sm">
                                                            {item.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                                                            <p className="text-[11px] text-slate-500 font-medium truncate">{item.email}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Score</span>
                                                            <p className="text-sm font-black text-blue-600">{item.totalScore || 0}</p>
                                                        </div>
                                                    </div>
                                                );
                                            } else if (modalData.type === 'courses' || modalData.type === 'quizzes') {
                                                return (
                                                    <div key={item._id || idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-indigo-100 transition-all">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                                            {modalData.type === 'courses' ? <BookOpen size={16} /> : <FileText size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                                {modalData.type === 'courses' ? `${item.price || 0} INR` : `${item.totalMarks || 0} Marks`}
                                                            </p>
                                                        </div>
                                                        {item.isActive ? (
                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">ACTIVE</span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">INACTIVE</span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
