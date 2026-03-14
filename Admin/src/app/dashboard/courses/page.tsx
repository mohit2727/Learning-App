'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    BookOpen,
    Plus,
    Loader2,
    Video,
    Trash2,
    Upload
} from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const { user, loading: authLoading } = useAuth();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState('0');
    const [isUploading, setIsUploading] = useState(false);

    const fetchCourses = async () => {
        if (authLoading || !user) return;
        setLoading(true);
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [authLoading, user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImage(data);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', { title, description, image, price });
            setShowCreateModal(false);
            fetchCourses();
            setTitle('');
            setDescription('');
            setImage('');
            setPrice('0');
        } catch (err) {
            alert('Failed to create playlist');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;
        try {
            await api.put(`/courses/${selectedCourse._id}`, { title, description, image, price });
            setShowEditModal(false);
            fetchCourses();
            setTitle('');
            setDescription('');
            setImage('');
            setPrice('0');
            setSelectedCourse(null);
        } catch (err) {
            alert('Failed to update playlist');
        }
    };

    const openEditModal = (course: any) => {
        setSelectedCourse(course);
        setTitle(course.title);
        setDescription(course.description || '');
        setImage(course.image || '');
        setPrice(String(course.price || 0));
        setShowEditModal(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/courses/${id}/status`, { isActive: !currentStatus });
            setCourses(courses.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) return;

        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
        } catch (err) {
            alert('Failed to delete playlist');
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Playlists & Courses</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Organize your educational content into playlists.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    New Playlist
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-16 text-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm font-bold text-sm">
                        No playlists found. Click New Playlist to get started.
                    </div>
                ) : courses.map((course) => (
                    <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden group hover:border-blue-400 hover:shadow-lg transition-all flex flex-col relative"
                    >
                        <div className="h-36 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                            {course.image ? (
                                <img src={course.image.startsWith('http') ? course.image : `${process.env.NEXT_PUBLIC_API_URL || 'https://learning-app-4xa9.onrender.com'}${course.image}`} alt={course.title} className="w-full h-full object-cover relative z-10" />
                            ) : (
                                <BookOpen className="w-12 h-12 text-slate-200 relative z-10 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                            )}

                            <div className="absolute top-3 right-3 z-20 flex gap-2">
                                <button
                                    onClick={() => openEditModal(course)}
                                    className="p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-slate-600 hover:text-blue-600 border border-slate-200 shadow-sm transition-all"
                                    title="Edit Playlist"
                                >
                                    <Plus className="w-3.5 h-3.5 rotate-45" />
                                </button>
                                <button
                                    onClick={() => toggleStatus(course._id, course.isActive)}
                                    className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest transition-all border shadow-sm ${course.isActive
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-white text-slate-400 border-slate-200"
                                        }`}
                                >
                                    {course.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </button>
                            </div>

                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-2 border border-slate-100 shadow-sm z-20">
                                <span className={`text-[10px] font-black ${course.price > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                                    {course.price > 0 ? `₹${course.price}` : 'FREE'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-sm font-black text-slate-900 line-clamp-1 mb-1 tracking-tight">{course.title}</h3>
                            <div className="flex items-center gap-1.5 mb-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                                <Video className="w-3 h-3" />
                                {course.lessons?.length || 0} Lessons
                            </div>

                            <div className="mt-auto flex items-center gap-2">
                                <Link
                                    href={`/dashboard/courses/${course._id}`}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-slate-200 active:scale-95"
                                >
                                    Manage Content
                                </Link>
                                <button
                                    onClick={() => handleDelete(course._id)}
                                    className="p-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors border border-slate-100 hover:border-red-100 shadow-sm"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Create Playlist</h2>
                            <p className="text-slate-400 mb-6 text-xs font-bold">Start organizing your curriculum into content channels.</p>

                            <form onSubmit={handleCreate} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Playlist Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        placeholder="e.g., UGC NET Preparation 2026"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail</label>
                                        <label className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer">
                                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            {image ? 'Change' : 'Upload'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>

                                {image && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-100">
                                        <img src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image}`} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-600 p-1.5 rounded-lg border border-slate-100 shadow-sm">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                                        placeholder="Briefly explain what's inside..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[1.5] bg-slate-900 hover:bg-slate-800 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95"
                                    >
                                        Create Playlist
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Edit Playlist</h2>
                            <p className="text-slate-400 mb-6 text-xs font-bold">Update the playlist metadata or thumbnail.</p>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Playlist Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail</label>
                                        <label className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer">
                                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            Update Image
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>

                                {image && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-100">
                                        <img src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image}`} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-600 p-1.5 rounded-lg border border-slate-100 shadow-sm">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedCourse(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[1.5] bg-slate-900 hover:bg-slate-800 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95"
                                    >
                                        Save Changes
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
