'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function MyCoursesPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken();
                setAuthToken(token);
                const data = await dataService.getMyCourses();
                setCourses(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 pt-12 pb-6 px-5 rounded-b-3xl">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-200 mb-3 hover:text-white">
                    <ChevronLeft size={18} /> Back
                </button>
                <h1 className="text-white text-xl font-bold">📚 My Enrolled Courses</h1>
                <p className="text-blue-200 text-sm mt-1">Courses you have access to</p>
            </div>

            <div className="px-4 py-5 space-y-3">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <BookOpen size={36} className="text-blue-400" />
                        </div>
                        <p className="font-bold text-gray-700 text-lg">No Courses Enrolled</p>
                        <p className="text-gray-500 text-sm mt-1">You haven't enrolled in any courses yet. Browse our playlists!</p>
                        <button onClick={() => router.push('/courses')} className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
                            Browse Courses
                        </button>
                    </div>
                ) : courses.map((course: any, i: number) => (
                    <Link key={course._id || i} href={`/courses/${course._id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-20 bg-blue-600 flex items-center justify-center relative">
                            {course.image
                                ? <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                : <span className="text-4xl">📚</span>
                            }
                            <span className="absolute top-2 right-2 bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">Enrolled</span>
                        </div>
                        <div className="p-4 flex items-center gap-3">
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{course.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5">📹 {course.lessons?.length || 0} videos</p>
                            </div>
                            <span className="text-blue-600 text-xl">›</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
