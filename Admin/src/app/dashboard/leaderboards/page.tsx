'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Trophy,
    Download,
    Search,
    Loader2,
    Calendar,
    Clock,
    Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LeaderboardsPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>('');
    const [leaderboardData, setLeaderboardData] = useState<any | null>(null);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const { user, loading: authLoading } = useAuth();

    // Fetch all quizzes for the dropdown
    const fetchQuizzes = async () => {
        if (authLoading || !user) return;
        setLoadingQuizzes(true);
        try {
            const { data } = await api.get('/tests');
            setQuizzes(data);
            if (data.length > 0) {
                // Optionally auto-select the first quiz
                setSelectedQuizId('');
            }
        } catch (err) {
            console.error('Failed to fetch quizzes');
        } finally {
            setLoadingQuizzes(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [authLoading, user]);

    // Fetch leaderboard when quiz is selected
    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!selectedQuizId) {
                setLeaderboardData(null);
                return;
            }
            setLoadingLeaderboard(true);
            try {
                const { data } = await api.get(`/tests/${selectedQuizId}/leaderboard`);
                setLeaderboardData(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard data');
                alert('Failed to load leaderboard. Please try again later.');
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchLeaderboard();
    }, [selectedQuizId]);

    const handleDownloadPDF = () => {
        if (!leaderboardData || !leaderboardData.rankings || leaderboardData.rankings.length === 0) {
            alert("No data available to download.");
            return;
        }

        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(18);
        doc.text(`Leaderboard: ${leaderboardData.quizTitle}`, 14, 22);
        
        // Add Subtitle / Details
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total Marks: ${leaderboardData.totalMarks || '-'}`, 14, 36);

        // Prepare Table Data
        const tableColumn = ["Rank", "Name", "Email", "Score", "Time Spent (min)", "Date Submitted"];
        const tableRows: any[] = [];

        leaderboardData.rankings.forEach((student: any, index: number) => {
            const studentData = [
                index + 1,
                student.name || 'N/A',
                student.email || 'N/A',
                `${student.score}`,
                `${student.timeSpent}`,
                new Date(student.submittedAt).toLocaleDateString()
            ];
            tableRows.push(studentData);
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 42,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] }, // TailWind blue-600
        });

        // Save PDF
        const safeTitle = leaderboardData.quizTitle.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`${safeTitle}_Leaderboard.pdf`);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Leaderboards</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">View and export student performance across quizzes.</p>
                </div>
                {leaderboardData && leaderboardData.rankings && leaderboardData.rankings.length > 0 && (
                    <button
                        onClick={handleDownloadPDF}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Download className="w-5 h-5" strokeWidth={2.5} />
                        Download PDF
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {/* Header Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex-1 w-full flex items-center gap-4">
                        <div className="relative w-full max-w-md">
                            <select
                                value={selectedQuizId}
                                onChange={(e) => setSelectedQuizId(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
                                disabled={loadingQuizzes}
                            >
                                <option value="" disabled className="text-slate-400 font-normal">-- Select a Quiz to load Leaderboard --</option>
                                {quizzes.map((quiz) => (
                                    <option key={quiz._id} value={quiz._id}>
                                        {quiz.title} {quiz.isActive ? '' : '(Inactive)'}
                                    </option>
                                ))}
                            </select>
                            <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {loadingQuizzes && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                    </div>
                </div>

                {/* Leaderboard Table Area */}
                <div className="flex-1 overflow-x-auto relative">
                    {loadingLeaderboard ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Fetching Rankings...</p>
                        </div>
                    ) : null}

                    {!selectedQuizId && !loadingQuizzes ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                                <Search className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">No Quiz Selected</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Please select a quiz from the dropdown menu above to view its leaderboard and export to PDF.</p>
                        </div>
                    ) : selectedQuizId && leaderboardData && leaderboardData.rankings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                                <Trophy className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">No Attempts Yet</h3>
                            <p className="text-slate-500 font-medium max-w-sm">There are no recorded attempts for "{leaderboardData.quizTitle}".</p>
                        </div>
                    ) : leaderboardData && leaderboardData.rankings.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                                    <th className="px-6 py-4">Student Info</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Time Spent</th>
                                    <th className="px-6 py-4 text-right">Date Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboardData.rankings.map((student: any, index: number) => {
                                    const isTop3 = index < 3;
                                    return (
                                        <tr key={student._id} className={`hover:bg-slate-50/80 transition-colors group ${index === 0 ? 'bg-amber-50/30' : index === 1 ? 'bg-slate-50' : index === 2 ? 'bg-orange-50/30' : ''}`}>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${
                                                    index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                                    index === 1 ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                                                    index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                                    'bg-white text-slate-400 border border-slate-200 font-bold'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                    {student.name || 'Unknown Student'}
                                                    {index === 0 && <Award className="w-4 h-4 text-amber-500 fill-amber-100" />}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{student.email || 'No email'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${isTop3 ? 'text-blue-600' : 'text-slate-700'}`}>
                                                        {student.score}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">/ {leaderboardData.totalMarks || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {student.timeSpent} min
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(student.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                                    {new Date(student.submittedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : null}
                </div>
            </div>
        </DashboardLayout>
    );
}
