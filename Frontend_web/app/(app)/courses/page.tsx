'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import Link from 'next/link';

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
            <div className="bg-blue-600 pt-12 pb-8 px-5 rounded-b-3xl mb-5">
                <h1 className="text-white text-2xl font-bold">▶️ Video Playlists</h1>
                <p className="text-blue-200 text-sm mt-1">Watch and learn from expert curated playlists</p>
            </div>

            <div className="px-4 pb-6 space-y-3">
                {loading ? (
                    <div className="flex justify-center pt-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : courses.length > 0 ? courses.map(course => (
                    <Link key={course._id} href={`/courses/${course._id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-24 bg-blue-600 flex items-end justify-end p-2">
                            <span className="bg-white/20 text-white text-xs font-bold rounded-full px-3 py-1">Playlist</span>
                        </div>
                        <div className="p-4">
                            <p className="font-bold text-gray-800 text-base">{course.title}</p>
                            <p className="text-gray-500 text-sm mt-1">📹 {course.lessons?.length || 0} videos</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-blue-600 font-bold text-lg">{course.price ? `₹${course.price}` : 'Free'}</span>
                                <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl">Watch</span>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center pt-20 text-gray-500">
                        <div className="text-5xl mb-3">📚</div>
                        <p className="font-semibold">No Playlists Yet</p>
                        <p className="text-sm mt-1">We're crafting new video playlists for you. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
