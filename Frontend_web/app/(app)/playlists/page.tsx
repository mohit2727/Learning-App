'use client';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { Play, BookOpen, Clock, ChevronRight, ShieldCheck, Lock, Unlock, Target } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

export default function PlaylistsPage() {
    const { user, loading: authLoading } = useAuth();

    const { data: videoPlaylists, isLoading: videoLoading } = useSWR(
        user ? 'video-playlists' : null,
        () => dataService.getVideoPlaylists()
    );

    const { data: quizPlaylists, isLoading: quizLoading } = useSWR(
        user ? 'quiz-playlists' : null,
        () => dataService.getQuizPlaylists()
    );

    if (authLoading || (videoLoading && quizLoading)) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Loading Playlists...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-gray-50 pb-24">
            {/* Gradient Header */}
            <div className="grad-header mb-8">
                <h1 className="text-white text-2xl font-black tracking-tight">Explore Playlists</h1>
                <p className="text-violet-200 text-sm mt-1 font-medium">Video lessons and practice bundles</p>
            </div>

            <div className="px-5 space-y-10">
                {/* Video Playlists Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                            <h2 className="text-gray-800 font-extrabold text-sm uppercase tracking-widest">Video Lessons</h2>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{videoPlaylists?.length || 0} Playlists</span>
                    </div>

                    <div className="space-y-4">
                        {videoPlaylists?.map((course: any) => (
                            <Link key={course._id} href={`/videos/${course._id}`}
                                className="block bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 card-hover group transition-all">
                                <div className="flex p-3 gap-4">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                        {course.image ? (
                                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-2xl opacity-40">📺</div>
                                        )}
                                        {!course.isEnrolled && course.price > 0 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Lock size={16} className="text-white/80" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 py-1 pr-2 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-gray-800 font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-violet-600 transition-colors">{course.title}</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Play size={10} strokeWidth={3} />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{course.lessons?.length || 0} Lessons</span>
                                                </div>
                                                {course.isEnrolled ? (
                                                    <div className="flex items-center gap-1 text-emerald-500">
                                                        <ShieldCheck size={10} strokeWidth={3} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Enrolled</span>
                                                    </div>
                                                ) : course.price > 0 ? (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-600">₹{course.price}</span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Free</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Quiz Playlists Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                            <h2 className="text-gray-800 font-extrabold text-sm uppercase tracking-widest">Practice Bundles</h2>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{quizPlaylists?.length || 0} Bundles</span>
                    </div>

                    <div className="space-y-4">
                        {quizPlaylists?.map((playlist: any) => (
                            <Link key={playlist._id} href={`/playlists/${playlist._id}`}
                                className="block bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 card-hover group transition-all">
                                <div className="flex p-3 gap-4">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                        {playlist.image ? (
                                            <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-amber-50 flex items-center justify-center text-2xl opacity-40">📝</div>
                                        )}
                                        {!playlist.hasAccess && playlist.price > 0 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Lock size={16} className="text-white/80" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 py-1 pr-2 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-gray-800 font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">{playlist.title}</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Target size={10} strokeWidth={3} />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{playlist.quizzes?.length || 0} Quizzes</span>
                                                </div>
                                                {playlist.hasAccess ? (
                                                    <div className="flex items-center gap-1 text-emerald-500">
                                                        <ShieldCheck size={10} strokeWidth={3} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Owned</span>
                                                    </div>
                                                ) : playlist.price > 0 ? (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">₹{playlist.price}</span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Free</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
