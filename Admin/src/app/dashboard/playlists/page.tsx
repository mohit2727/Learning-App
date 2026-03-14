'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    Plus,
    Search,
    Loader2,
    Eye,
    Pencil,
    Trash2,
    X,
    CheckCircle2,
    ListChecks,
    HelpCircle,
    Package
} from 'lucide-react';

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);
    const { user, loading: authLoading } = useAuth();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0');
    const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        if (authLoading || !user) return;
        setLoading(true);
        try {
            const [playlistRes, quizRes] = await Promise.all([
                api.get('/quiz-playlists'),
                api.get('/tests')
            ]);
            setPlaylists(playlistRes.data);
            setQuizzes(quizRes.data);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [authLoading, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            title,
            description,
            price: Number(price),
            quizzes: selectedQuizzes
        };

        try {
            if (editingPlaylist) {
                await api.put(`/quiz-playlists/${editingPlaylist._id}`, payload);
            } else {
                await api.post('/quiz-playlists', payload);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            alert('Failed to save playlist');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrice('0');
        setSelectedQuizzes([]);
        setEditingPlaylist(null);
    };

    const openEditModal = (playlist: any) => {
        setEditingPlaylist(playlist);
        setTitle(playlist.title);
        setDescription(playlist.description);
        setPrice(String(playlist.price));
        setSelectedQuizzes(playlist.quizzes.map((q: any) => q._id || q));
        setShowModal(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/quiz-playlists/${id}`, { isActive: !currentStatus });
            setPlaylists(playlists.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this playlist? Linked quizzes won't be deleted.")) return;
        try {
            await api.delete(`/quiz-playlists/${id}`);
            setPlaylists(playlists.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete playlist');
        }
    };

    const toggleQuizSelection = (id: string) => {
        setSelectedQuizzes(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Quiz Playlists</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Group quizzes into paid bundles for students.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Create Playlist
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Quizzes</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : playlists.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                                        No playlists found. Create one to get started.
                                    </td>
                                </tr>
                            ) : playlists.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{p.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                            {p.quizzes?.length || 0} items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-black ${p.price > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                                            {p.price > 0 ? `₹${p.price}` : 'FREE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(p._id, p.isActive)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border ${p.isActive
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-slate-100 text-slate-500 border-slate-200"
                                                }`}
                                        >
                                            {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEditModal(p)} className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg">
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

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[1.5rem] shadow-2xl relative z-10">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900">{editingPlaylist ? 'Edit Playlist' : 'New Quiz Playlist'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Playlist Title</label>
                                        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" placeholder="e.g., Anatomy Master Bundle" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                                        <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                        <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold min-h-[80px]" placeholder="What's included in this bundle?" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Quizzes ({selectedQuizzes.length})</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-2">
                                        {quizzes.length === 0 ? (
                                            <p className="text-center py-4 text-xs font-bold text-slate-400">No quizzes available. Go to Quiz Management to create some.</p>
                                        ) : quizzes.map(q => (
                                            <div key={q._id} onClick={() => toggleQuizSelection(q._id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedQuizzes.includes(q._id) ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-100 text-slate-600'}`}>
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${selectedQuizzes.includes(q._id) ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                                                    {selectedQuizzes.includes(q._id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold">{q.title}</p>
                                                    <p className="text-[10px] opacity-60 font-bold uppercase">{q.totalQuestions} Questions • {q.duration} Min</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm">Cancel</button>
                                    <button type="submit" disabled={submitting || selectedQuizzes.length === 0} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                                        {submitting ? 'Saving...' : editingPlaylist ? 'Save Changes' : 'Create Playlist'}
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
