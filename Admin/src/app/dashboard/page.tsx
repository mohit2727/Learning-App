'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, BookOpen, FileText, TrendingUp, ArrowRight, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-slate-200 p-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 group flex items-center gap-4"
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
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            if (!isLoaded || !isSignedIn) return;

            try {
                const token = await getToken();
                if (!token) return;

                const { data } = await api.get('/users/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, [getToken, isLoaded, isSignedIn]);

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
                />
                <StatCard
                    title="Paid Users"
                    value={stats?.paidUsers || '0'}
                    icon={Heart}
                    color="text-pink-600"
                    bg="bg-pink-50"
                />
                <StatCard
                    title="Active Courses"
                    value={stats?.courses || '0'}
                    icon={BookOpen}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    title="AI Quizzes"
                    value={stats?.quizzes || '0'}
                    icon={FileText}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
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
        </DashboardLayout>
    );
}
