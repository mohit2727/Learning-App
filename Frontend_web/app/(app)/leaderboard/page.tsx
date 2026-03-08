'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardPage() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [board, setBoard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        if (!isLoaded || !isSignedIn) return;
        setLoading(true);
        try {
            const token = await getToken();
            setAuthToken(token);
            const data = await dataService.getLeaderboard();
            setBoard(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [isLoaded, isSignedIn]);

    const rankEl = (i: number) => {
        if (i === 0) return <Trophy className="text-yellow-500" size={22} />;
        if (i === 1) return <Medal className="text-gray-400" size={22} />;
        if (i === 2) return <Award className="text-amber-600" size={22} />;
        return <span className="font-bold text-gray-400 text-base w-6 text-center">{i + 1}</span>;
    };

    const borderClass = (i: number) => i === 0 ? 'border-yellow-400 bg-yellow-50' : i === 1 ? 'border-gray-300' : i === 2 ? 'border-amber-400' : 'border-transparent';
    const scoreClass = (i: number) => i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : i === 2 ? 'text-amber-600' : 'text-blue-600';
    const avatarBg = (i: number) => i === 0 ? 'bg-yellow-100' : i === 1 ? 'bg-gray-100' : i === 2 ? 'bg-amber-100' : 'bg-blue-50';

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
                <p className="text-gray-500 text-sm mt-1">Top 10 Students by Score</p>
            </div>

            <div className="px-4 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center pt-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : board.length === 0 ? (
                    <p className="text-center text-gray-500 pt-20 italic">No scores recorded yet.</p>
                ) : board.map((student, i) => (
                    <div key={student._id || i} className={`flex items-center bg-white p-4 rounded-2xl shadow-sm border ${borderClass(i)}`}>
                        <div className="w-10 flex items-center justify-center">{rankEl(i)}</div>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-3 ${avatarBg(i)}`}>
                            <span className={`font-bold text-lg ${scoreClass(i)}`}>{student.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                            <p className={`font-bold text-base ${i < 3 ? 'text-gray-900' : 'text-gray-700'}`}>{student.name}</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-xl ${scoreClass(i)}`}>{student.totalScore}</p>
                            <p className="text-xs text-gray-500 font-semibold tracking-wider">PTS</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
