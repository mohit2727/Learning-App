'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ClipboardList } from 'lucide-react';

export default function MyTestsPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken();
                setAuthToken(token);
                const data = await dataService.getMyTests();
                setAttempts(data);
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
                <h1 className="text-white text-xl font-bold">📋 My Test Attempts</h1>
                <p className="text-blue-200 text-sm mt-1">Your quiz history and scores</p>
            </div>

            <div className="px-4 py-5 space-y-3">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : attempts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <ClipboardList size={36} className="text-blue-400" />
                        </div>
                        <p className="font-bold text-gray-700 text-lg">No Attempts Yet</p>
                        <p className="text-gray-500 text-sm mt-1">You haven't attempted any quizzes yet. Go take a test!</p>
                        <button onClick={() => router.push('/tests')} className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
                            Browse Quizzes
                        </button>
                    </div>
                ) : attempts.map((attempt: any, i: number) => {
                    const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
                    const passed = pct >= 60;
                    return (
                        <div key={attempt._id || i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{attempt.testTitle || attempt.quiz?.title || 'Quiz'}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {passed ? 'Passed' : 'Failed'}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                                <div className="text-center">
                                    <p className="text-xl font-black text-blue-600">{attempt.score}<span className="text-sm text-gray-400">/{attempt.totalMarks || '?'}</span></p>
                                    <p className="text-xs text-gray-500">Score</p>
                                </div>
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <p className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
