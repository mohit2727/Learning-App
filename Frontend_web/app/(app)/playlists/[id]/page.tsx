'use client';
import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, PlayCircle, Lock, Unlock, Clock, HelpCircle } from 'lucide-react';

export default function PlaylistDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const [playlist, setPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (authLoading || !user) return;
        const load = async () => {
            try {
                const token = await user.getIdToken();
                setAuthToken(token);
                // We don't have a direct getPlaylistById in dataService yet, so we'll fetch from API directly
                const api = (await import('@/lib/api')).default;
                const { data } = await api.get(`/quiz-playlists/${id}`);
                setPlaylist(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, authLoading, user]);

    const handleQuizClick = (quiz: any) => {
        if (quiz.isLocked) {
            alert('This quiz is locked by the admin.');
            return;
        }
        router.push(`/tests/${quiz._id}`);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!playlist) return (
        <div className="flex-1 p-8 text-center">
            <p className="text-gray-500 font-medium">Playlist not found.</p>
            <button onClick={() => router.back()} className="mt-4 text-violet-600 font-bold">Go Back</button>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-5 pt-8 pb-10 rounded-b-[2.5rem] shadow-lg relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative z-10">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all mb-6">
                        <ChevronLeft size={24} className="text-white" />
                    </button>

                    <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block backdrop-blur-sm">
                        PREMIUM PLAYLIST
                    </span>
                    <h1 className="text-white text-3xl font-black tracking-tight leading-tight mb-2">
                        {playlist.title}
                    </h1>
                    <p className="text-violet-100/80 text-sm font-medium leading-relaxed max-w-sm line-clamp-3">
                        {playlist.description}
                    </p>
                </div>
            </div>

            {/* Quizzes List */}
            <div className="px-5 space-y-4 relative z-20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                    <h2 className="text-gray-800 font-black text-sm uppercase tracking-widest">Included Quizzes</h2>
                </div>

                {!playlist.quizzes || playlist.quizzes.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-gray-100 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <HelpCircle size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">No quizzes found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {playlist.quizzes.map((quiz: any, index: number) => (
                            <button
                                key={quiz._id}
                                onClick={() => handleQuizClick(quiz)}
                                className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 text-left hover:shadow-md hover:border-violet-100 transition-all group"
                            >
                                <div className="w-14 h-14 bg-gray-50 group-hover:bg-violet-50 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                                    <span className="text-gray-400 group-hover:text-violet-500 font-black text-lg">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-800 font-bold text-base leading-tight group-hover:text-violet-700 transition-colors line-clamp-1">
                                        {quiz.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <HelpCircle size={12} strokeWidth={3} />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">{quiz.totalQuestions || 0} Qs</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Clock size={12} strokeWidth={3} />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">{quiz.duration || 0} Mins</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 group-hover:bg-violet-600 group-hover:text-white text-gray-400 transition-all">
                                    {quiz.isLocked ? <Lock size={18} /> : <PlayCircle size={18} className="ml-0.5" />}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
