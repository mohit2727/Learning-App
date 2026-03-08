'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/lib/api';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function ActiveTestPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [test, setTest] = useState<any>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        dataService.getTestById(id).then(t => {
            setTest(t);
            setAnswers(new Array(t.questions.length).fill(null));
            setTimeLeft((t.duration || 20) * 60);
            setLoading(false);
        }).catch(console.error);
    }, [id]);

    useEffect(() => {
        if (!test) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [test]);

    const handleSubmit = async () => {
        if (submitting || !test) return;
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        try {
            const result = await dataService.submitTest(id, answers);
            router.replace(`/tests/${id}/result?score=${result.score}&total=${result.total}`);
        } catch (e) {
            console.error(e);
            setSubmitting(false);
        }
    };

    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    const q = test?.questions?.[current];

    if (loading) return <div className="flex-1 flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Timer Header */}
            <div className="bg-blue-600 pt-12 pb-4 px-5 rounded-b-3xl flex items-center justify-between">
                <div>
                    <p className="text-blue-200 text-xs">Question {current + 1}/{test.questions.length}</p>
                    <p className="text-white font-bold">{test.title}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
                    <Clock size={16} className="text-white" />
                    <span className={`font-bold text-base ${timeLeft < 60 ? 'text-red-300' : 'text-white'}`}>{mins}:{secs}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="mx-4 mt-4 bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / test.questions.length) * 100}%` }} />
            </div>

            {/* Question */}
            <div className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm flex-1">
                <p className="font-bold text-gray-800 text-base leading-relaxed mb-5">{q.question}</p>
                <div className="space-y-3">
                    {q.options.map((opt: string, i: number) => (
                        <button key={i} onClick={() => {
                            const a = [...answers]; a[current] = i; setAnswers(a);
                        }} className={`w-full text-left p-4 rounded-xl border-2 transition-colors font-medium ${answers[current] === i ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300'}`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="p-4 flex gap-3">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 font-semibold disabled:opacity-40">
                    <ChevronLeft size={18} /> Prev
                </button>
                {current < test.questions.length - 1
                    ? <button onClick={() => setCurrent(c => c + 1)} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white rounded-xl py-3 font-semibold">
                        Next <ChevronRight size={18} />
                    </button>
                    : <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-green-600 text-white rounded-xl py-3 font-bold">
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                }
            </div>
        </div>
    );
}
