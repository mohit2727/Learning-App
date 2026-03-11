'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    FileUp,
    Search,
    Plus,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    Trash2,
    X,
    Clock,
    HelpCircle,
    Pencil
} from 'lucide-react';

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewQuiz, setViewQuiz] = useState<any | null>(null);
    const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
    const { user, loading: authLoading } = useAuth();

    // Form state
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('30');
    const [totalMarks, setTotalMarks] = useState('100');
    const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false);
    const [negativeRatio, setNegativeRatio] = useState('0.25');
    const [price, setPrice] = useState('0');
    const [file, setFile] = useState<File | null>(null);

    const fetchQuizzes = async () => {
        if (authLoading || !user) return;
        setLoading(true);
        try {
            const { data } = await api.get('/tests');
            setQuizzes(data);
        } catch (err) {
            console.error('Failed to fetch quizzes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [authLoading, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            if (editingQuiz) {
                // Update implementation
                await api.put(`/tests/${editingQuiz._id}`, {
                    title,
                    duration,
                    totalMarks,
                    negativeMarkingEnabled,
                    negativeRatio,
                    price
                });
            } else {
                // Upload/Generate implementation
                if (!file) {
                    alert('Please select a file to generate a quiz');
                    setUploading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('file', file);
                formData.append('title', title);
                formData.append('duration', duration);
                formData.append('totalMarks', totalMarks);
                formData.append('negativeMarkingEnabled', String(negativeMarkingEnabled));
                formData.append('negativeRatio', negativeRatio);
                formData.append('price', price);

                await api.post('/upload/quiz', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            setShowUploadModal(false);
            setEditingQuiz(null);
            fetchQuizzes();
            // Reset form
            setTitle('');
            setPrice('0');
            setFile(null);
        } catch (err) {
            alert(editingQuiz ? 'Failed to update quiz' : 'Failed to generate quiz. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const openEditModal = (quiz: any) => {
        setEditingQuiz(quiz);
        setTitle(quiz.title);
        setDuration(String(quiz.duration));
        setTotalMarks(String(quiz.totalMarks || 100));
        setNegativeMarkingEnabled(quiz.negativeMarkingEnabled || false);
        setNegativeRatio(String(quiz.negativeRatio || 0.25));
        setPrice(String(quiz.price || 0));
        setShowUploadModal(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/tests/${id}/status`, { isActive: !currentStatus });
            setQuizzes(quizzes.map(q => q._id === id ? { ...q, isActive: !currentStatus } : q));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;

        try {
            await api.delete(`/tests/${id}`);
            setQuizzes(quizzes.filter(q => q._id !== id));
        } catch (err) {
            alert('Failed to delete quiz');
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Quiz Management</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Create and manage AI-powered interactive quizzes.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingQuiz(null);
                        setTitle('');
                        setDuration('30');
                        setTotalMarks('100');
                        setNegativeMarkingEnabled(false);
                        setNegativeRatio('0.25');
                        setPrice('0');
                        setShowUploadModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Generate New Quiz
                </button>
            </div>

            {/* Content */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search quizzes..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Marks</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : quizzes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                                        No quizzes found. Click Generate New Quiz to create one.
                                    </td>
                                </tr>
                            ) : quizzes.map((quiz) => (
                                <tr key={quiz._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 text-sm">{quiz.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{quiz.fileSource || 'Manual'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                            {quiz.questions?.length || 0} items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-800">{quiz.totalMarks || 0}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black tracking-widest ${quiz.price > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                                            {quiz.price > 0 ? `₹${quiz.price}` : 'FREE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                                        {quiz.duration} min
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(quiz._id, quiz.isActive)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border ${quiz.isActive
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                                }`}
                                        >
                                            {quiz.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setViewQuiz(quiz)}
                                                className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                                title="View Questions"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(quiz)}
                                                className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                                                title="Edit Settings"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz._id)}
                                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                title="Delete Quiz"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Quiz Modal */}
            <AnimatePresence>
                {viewQuiz && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewQuiz(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[1.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-white relative z-20">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest ${viewQuiz.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                            {viewQuiz.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{viewQuiz.title}</h2>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> {viewQuiz.questions?.length || 0} Questions</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-slate-900">₹{viewQuiz.price > 0 ? viewQuiz.price : 'Free'}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {viewQuiz.duration}min</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewQuiz(null)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable Questions) */}
                            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/30 custom-scrollbar">
                                {viewQuiz.questions?.length > 0 ? (
                                    <div className="space-y-4">
                                        {viewQuiz.questions.map((q: any, i: number) => (
                                            <div key={q._id || i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                                <div className="flex gap-3 mb-4">
                                                    <span className="text-blue-600 font-black text-sm pt-0.5">{i + 1}.</span>
                                                    <h4 className="text-sm font-bold text-slate-800 leading-relaxed">
                                                        {q.text}
                                                    </h4>
                                                </div>
                                                <div className="space-y-2 pl-7">
                                                    {q.options.map((opt: string, optIndex: number) => {
                                                        const isCorrect = q.correctOption === optIndex;
                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-2.5 rounded-lg border flex items-center gap-3 text-xs font-bold transition-all ${isCorrect
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
                                                                    : 'bg-white border-slate-100 text-slate-500'
                                                                    }`}
                                                            >
                                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                                                    }`}>
                                                                    {String.fromCharCode(65 + optIndex)}
                                                                </div>
                                                                {opt}
                                                                {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400 text-sm font-bold">
                                        No questions recorded for this quiz.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowUploadModal(false);
                                setEditingQuiz(null);
                            }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">
                                {editingQuiz ? 'Edit Quiz Settings' : 'AI Quiz Builder'}
                            </h2>
                            <p className="text-slate-400 mb-6 text-xs font-bold">
                                {editingQuiz
                                    ? 'Update the metadata for this assessment.'
                                    : 'Upload a study material to generate questions using AI.'
                                }
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quiz Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        placeholder="e.g., General Anatomy Mock Test"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Duration (min)</label>
                                        <input
                                            type="number"
                                            required
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Marks</label>
                                        <input
                                            type="number"
                                            required
                                            value={totalMarks}
                                            onChange={(e) => setTotalMarks(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-xs font-black text-slate-700">Negative Marking</label>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Deduct for errors</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNegativeMarkingEnabled(!negativeMarkingEnabled)}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${negativeMarkingEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${negativeMarkingEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>

                                    {negativeMarkingEnabled && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                                            {['0.25', '0.33', '0.50'].map((ratio) => (
                                                <button
                                                    key={ratio}
                                                    type="button"
                                                    onClick={() => setNegativeRatio(ratio)}
                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all ${negativeRatio === ratio
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {ratio === '0.25' ? '1/4' : ratio === '0.33' ? '1/3' : '1/2'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pricing (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">₹</span>
                                        <input
                                            type="number"
                                            required
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="0 for free"
                                        />
                                    </div>
                                </div>

                                {!editingQuiz && (
                                    <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.docx,.csv"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <FileUp className="text-blue-600 w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-black text-slate-700 truncate max-w-full px-2">{file ? file.name : "Select study material"}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">PDF, DOCX, or CSV</p>
                                        </label>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setEditingQuiz(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || (!editingQuiz && !file)}
                                        className="flex-[1.5] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{editingQuiz ? 'SAVING...' : 'AI WORKING...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingQuiz ? 'SAVE CHANGES' : 'GENERATE NOW'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
