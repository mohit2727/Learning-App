'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    Search,
    Loader2,
    Eye,
    Trash2,
    X,
    User,
    Phone,
    Mail,
    MapPin,
    Award,
    BookOpen,
    Calendar,
    Pencil,
    Shield
} from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewUser, setViewUser] = useState<any | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const { user: currentUser, loading: authLoading } = useAuth();

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editMobile, setEditMobile] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('student');

    const fetchUsers = async () => {
        if (authLoading || !currentUser) return;
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [authLoading, currentUser]);

    const handleViewDetails = async (id: string) => {
        try {
            const { data } = await api.get(`/users/${id}`);
            setViewUser(data);
        } catch (err) {
            alert('Failed to load user details');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setSaving(true);

        try {
            await api.put(`/users/${editingUser._id}`, {
                name: editName,
                mobile: editMobile,
                email: editEmail,
                role: editRole
            });
            setEditingUser(null);
            fetchUsers();
            if (viewUser?._id === editingUser._id) {
                handleViewDetails(editingUser._id);
            }
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this user? This will also remove all their test history. This action cannot be undone.")) return;

        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            if (viewUser?._id === id) setViewUser(null);
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openEditModal = (u: any) => {
        setEditingUser(u);
        setEditName(u.name || '');
        setEditMobile(u.mobile || '');
        setEditEmail(u.email || '');
        setEditRole(u.role || 'student');
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Manage students, view performance, and handle accounts.</p>
                </div>
                <div className="flex bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
                    <div className="px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Total Students</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{users.length}</p>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/10">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search by name, email, or mobile..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all shadow-indigo-100/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Enrolled</th>
                                <th className="px-6 py-4">Total Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs border border-white">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{u.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-700">{u.mobile || 'No Mobile'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{u.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                            {u.enrolledCourses?.length || 0} COURSES
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <Award className="w-3 h-3 text-amber-500" />
                                            <p className="text-sm font-black text-slate-800">{u.totalScore || 0}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleViewDetails(u._id)}
                                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                                title="View History"
                                            >
                                                <Eye className="w-4.5 h-4.5" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(u)}
                                                className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100"
                                                title="Edit Profile"
                                            >
                                                <Pencil className="w-4.5 h-4.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                title="Delete Account"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View User Modal */}
            <AnimatePresence>
                {viewUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewUser(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-slate-900 p-8 text-white relative">
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-2xl">
                                            {viewUser.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{viewUser.name}</h2>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">{viewUser.role}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                <span className="text-white/60 text-xs font-semibold">Member since {new Date(viewUser.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewUser(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Profile Info */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2] mb-4">Contact Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Phone size={14} /></div>
                                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p><p className="text-xs font-black text-slate-800">{viewUser.mobile || 'N/A'}</p></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Mail size={14} /></div>
                                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><p className="text-xs font-black text-slate-800 text-ellipsis overflow-hidden">{viewUser.email}</p></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><MapPin size={14} /></div>
                                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Location</p><p className="text-xs font-black text-slate-800">{viewUser.city ? `${viewUser.city}, ${viewUser.state}` : 'N/A'}</p></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Calendar size={14} /></div>
                                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Age</p><p className="text-xs font-black text-slate-800">{viewUser.age || 'N/A'}</p></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Test Attempts */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2] mb-4">Assessment History</h3>
                                            <div className="space-y-3">
                                                {viewUser.attempts?.length > 0 ? (
                                                    viewUser.attempts.map((a: any) => (
                                                        <div key={a._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                                    {a.score >= (a.totalMarks / 2) ? '✓' : '✗'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-800">{a.test?.title || 'Unknown Test'}</p>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(a.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-blue-600">{a.score}/{a.totalMarks}</p>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Points</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center py-4 text-xs font-bold text-slate-400">No test attempts recorded.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Performance Card */}
                                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
                                            <Award className="w-8 h-8 opacity-40 mb-3" />
                                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest leading-none mb-1">Lifetime Score</p>
                                            <p className="text-3xl font-black tracking-tighter mb-4">{viewUser.totalScore || 0}</p>
                                            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                                                <div><p className="text-[8px] font-black text-blue-200 uppercase">Rank</p><p className="text-sm font-black">#--</p></div>
                                                <div><p className="text-[8px] font-black text-blue-200 uppercase">Avg Pct</p><p className="text-sm font-black">--%</p></div>
                                            </div>
                                        </div>

                                        {/* Enrolled Courses */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2] mb-4">Active Learning</h3>
                                            <div className="space-y-3">
                                                {viewUser.enrolledCourses?.length > 0 ? (
                                                    viewUser.enrolledCourses.map((c: any) => (
                                                        <div key={c._id} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><BookOpen size={14} /></div>
                                                            <p className="text-xs font-bold text-slate-700 truncate">{c.title}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Not enrolled in any courses</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingUser(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Edit Student Profile</h2>
                            <p className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-tight">Updating: {editingUser.name}</p>

                            <form onSubmit={handleUpdateUser} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                                    <input
                                        required
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                                    <input
                                        value={editMobile}
                                        onChange={(e) => setEditMobile(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Access Role</label>
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 px-4 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[1.5] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm px-4 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Account'}
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
