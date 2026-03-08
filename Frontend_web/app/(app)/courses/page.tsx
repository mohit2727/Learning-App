'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import Link from 'next/link';
import { Play, BookOpen, Clock, ChevronRight } from 'lucide-react';

export default function CoursesPage() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        const load = async () => {
            try {
                const token = await getToken();
                setAuthToken(token);
                const data = await dataService.getCourses();
                setCourses(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [isLoaded, isSignedIn]);

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Gradient Header */}
            <div className="grad-header mb-6">
                <h1 className="text-white text-2xl font-black tracking-tight">Video Playlists</h1>
                <p className="text-violet-200 text-sm mt-1 font-medium">Expert curated learning paths</p>
            </div>

            <div className="px-5 pb-8 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-20 gap-3">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm font-medium">Loading Playlists...</p>
                    </div>
                ) : courses.length > 0 ? courses.map(course => (
                    <Link key={course._id} href={`/courses/${course._id}`}
                        className="block card card-hover border border-white relative group">
                        <div className="relative h-32 w-full overflow-hidden">
                            {course.image ? (
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                                    <BookOpen size={48} className="text-white/20" />
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/20">
                                    {course.price ? 'Premium' : 'Free Entry'}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <Play size={12} className="text-white" fill="white" />
                                    </div>
                                    <span className="text-white text-xs font-bold">{course.lessons?.length || 0} Videos</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-extrabold text-gray-800 text-lg leading-tight group-hover:text-violet-600 transition-colors">{course.title}</h3>
                            <p className="text-gray-500 text-xs mt-1.5 line-clamp-1">{course.description || 'Comprehensive video series for your preparation.'}</p>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1 text-violet-600">
                                    <span className="text-lg font-black">{course.price ? `₹${course.price}` : 'FREE'}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-violet-600 text-white text-[11px] font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-violet-200">
                                    START LEARNING <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center pt-20 px-10">
                        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={40} className="text-violet-300" />
                        </div>
                        <p className="font-extrabold text-gray-800 text-lg">No Playlists Yet</p>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">We're crafting new video playlists for you. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
