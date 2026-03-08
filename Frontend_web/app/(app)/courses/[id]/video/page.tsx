'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function VideoPlayerPage() {
    const params = useSearchParams();
    const router = useRouter();
    const videoId = params.get('videoId') || '';
    const courseTitle = params.get('courseTitle') || '';
    const lessonTitle = params.get('lessonTitle') || 'Lesson';

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;

    return (
        <div className="flex flex-col min-h-full bg-black">
            {/* Back */}
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 px-4">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-white/80 hover:text-white bg-black/30 rounded-full px-3 py-1.5">
                    <ChevronLeft size={18} /> <span className="text-sm font-medium">Back</span>
                </button>
            </div>

            {/* Video */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={lessonTitle}
                />
            </div>

            <div className="bg-white flex-1 p-5 rounded-t-3xl -mt-3 relative z-10">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{courseTitle}</p>
                <p className="text-gray-800 font-bold text-lg">{lessonTitle}</p>
            </div>
        </div>
    );
}
