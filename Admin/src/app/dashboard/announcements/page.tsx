'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Megaphone, Clock, Upload, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [image, setImage] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { getToken } = useAuth();

    const fetchAnnouncements = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/announcements/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [getToken]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = await getToken();
            const { data } = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
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
        if (!title || !body) return;

        setIsLoading(true);
        try {
            const token = await getToken();
            if (editingId) {
                await api.put(`/announcements/${editingId}`, { title, body, image, isActive: true }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post('/announcements', { title, body, image, isActive: true }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setTitle('');
            setBody('');
            setImage('');
            setEditingId(null);
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to save announcement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (announcement: any) => {
        setEditingId(announcement._id);
        setTitle(announcement.title);
        setBody(announcement.body);
        setImage(announcement.image || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const token = await getToken();
            await api.delete(`/announcements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to delete announcement:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-10 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Announcements</h1>
                    <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-tight">Manage broadcast messages sent to all students.</p>
                </div>
                <div className="bg-slate-100 p-3 rounded-2xl hidden md:block border border-slate-200 shadow-sm">
                    <Megaphone className="w-6 h-6 text-slate-400" strokeWidth={2.5} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Create/Edit Form */}
                <div className="lg:col-span-4 sticky top-6">
                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden">
                        <h2 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
                            {editingId ? 'Edit Broadcast' : 'New Broadcast'}
                        </h2>
                        <p className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-widest">Blast a message to all users.</p>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Announcement Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. New Batch Starting Soon"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Banner Image</label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            placeholder="Thumbnail URL..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                        <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl cursor-pointer transition-colors border border-blue-100 flex items-center justify-center min-w-[45px]">
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                    {image && (
                                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                                            <img src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image}`} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setImage('')} className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-slate-600 p-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Message Body</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200 active:scale-95"
                                >
                                    {isLoading ? 'Publishing...' : editingId ? 'Update News' : 'Publish News'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            setTitle('');
                                            setBody('');
                                            setImage('');
                                        }}
                                        className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm relative min-h-[500px]">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <span className="bg-blue-600 w-1.5 h-5 rounded-full" />
                                Broadcast History
                            </h2>
                            <span className="bg-slate-50 text-slate-400 font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border border-slate-100">
                                {announcements.length} Total
                            </span>
                        </div>

                        {announcements.length === 0 ? (
                            <div className="text-center py-24 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                    <Megaphone className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Bulletins Sent</h3>
                                <p className="text-slate-400 mt-1 text-xs font-bold">Your broadcast history will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {announcements.map((announcement) => (
                                    <div key={announcement._id} className="bg-white border border-slate-100 rounded-2xl p-5 relative group hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md">
                                        <div className="flex flex-col md:flex-row gap-5">
                                            {announcement.image && (
                                                <div className="w-full md:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                                                    <img src={announcement.image.startsWith('http') ? announcement.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${announcement.image}`} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1 gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 truncate leading-tight tracking-tight uppercase">{announcement.title}</h3>
                                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        <span className="text-[9px] font-black tracking-widest">ACTIVE</span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-xs leading-relaxed font-bold line-clamp-2 mb-3">{announcement.body}</p>
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Clock className="w-3 h-3" />
                                                    <p className="text-[10px] font-black uppercase tracking-tight">
                                                        Sent {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="p-1.5 bg-white text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200 hover:border-blue-200 shadow-sm transition-all"
                                                title="Edit"
                                            >
                                                <Plus className="w-3.5 h-3.5 rotate-45" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement._id)}
                                                className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 hover:border-red-200 shadow-sm transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
