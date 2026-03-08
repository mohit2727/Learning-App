'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/lib/api';
import { ChevronLeft, Play } from 'lucide-react';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dataService.getCourseDetail(id).then(setCourse).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex-1 flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
    if (!course) return <div className="flex-1 flex items-center justify-center h-screen text-gray-500">Course not found.</div>;

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 pt-12 pb-6 px-5 rounded-b-3xl">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-200 mb-3"><ChevronLeft size={18} /> Back</button>
                <h1 className="text-white text-xl font-bold">{course.title}</h1>
                <p className="text-blue-200 text-sm mt-1">{course.lessons?.length || 0} lessons</p>
            </div>

            <div className="px-4 py-5 space-y-3">
                {course.description && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <p className="font-bold text-gray-800 mb-2">About this Course</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                    </div>
                )}

                <p className="font-bold text-gray-800">📹 Lessons</p>
                {course.lessons?.length > 0 ? course.lessons.map((lesson: any, i: number) => (
                    <button key={lesson._id || i} onClick={() => router.push(`/courses/${id}/video?lessonIndex=${i}&courseTitle=${encodeURIComponent(course.title)}&videoId=${lesson.videoId}`)} className="w-full text-left bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Play size={16} className="text-blue-600" fill="#2563EB" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{lesson.title}</p>
                            {lesson.duration && <p className="text-gray-400 text-xs mt-0.5">⏱️ {lesson.duration}</p>}
                        </div>
                        <span className="text-gray-400">›</span>
                    </button>
                )) : (
                    <p className="text-gray-500 text-center py-8">No lessons in this course yet.</p>
                )}
            </div>
        </div>
    );
}
