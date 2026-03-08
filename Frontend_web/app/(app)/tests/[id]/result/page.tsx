'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestResultPage() {
    const params = useSearchParams();
    const router = useRouter();
    const score = Number(params.get('score') ?? 0);
    const total = Number(params.get('total') ?? 0);
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-full bg-gray-50 p-6">
            <div className="bg-white rounded-3xl p-8 w-full shadow-md text-center">
                <div className="text-6xl mb-4">{pct >= 60 ? '🎉' : '📚'}</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{pct >= 60 ? 'Great Job!' : 'Keep Practicing!'}</h1>
                <p className="text-gray-500 mb-6">{pct >= 60 ? "You've done well on this quiz." : 'Review the topics and try again.'}</p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <p className="text-5xl font-black text-blue-600">{score}<span className="text-2xl text-gray-400">/{total}</span></p>
                    <p className="text-gray-500 mt-1 font-medium">{pct}% Score</p>
                </div>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${pct >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {pct >= 60 ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {pct >= 60 ? 'Passed' : 'Below Pass Mark'}
                </div>

                <div className="space-y-3">
                    <button onClick={() => router.push('/tests')} className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold">
                        Back to Quizzes
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
