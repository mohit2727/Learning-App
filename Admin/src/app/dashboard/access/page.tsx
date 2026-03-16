'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Loader2,
    Search,
    User,
    CheckCircle2,
    Key
} from 'lucide-react';

export default function ManualAccessPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    
    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // Items state
    const [grantType, setGrantType] = useState('quiz');
    const [grantItemId, setGrantItemId] = useState('');
    const [availableItems, setAvailableItems] = useState<{ quizzes: any[], courses: any[], playlists: any[] }>({ quizzes: [], courses: [], playlists: [] });
    const [loadingItems, setLoadingItems] = useState(true);
    
    const [grantingAccess, setGrantingAccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (authLoading || !currentUser) return;
            setLoadingUsers(true);
            setLoadingItems(true);
            try {
                // Fetch users
                const usersRes = await api.get('/users');
                setUsers(usersRes.data);

                // Fetch items
                const [quizzesRes, coursesRes, playlistsRes] = await Promise.all([
                    api.get('/tests'),
                    api.get('/courses'),
                    api.get('/quiz-playlists')
                ]);
                
                console.log('Quizzes Response:', quizzesRes.data);
                console.log('Courses Response:', coursesRes.data);
                console.log('Playlists Response:', playlistsRes.data);
                setAvailableItems({
                    quizzes: quizzesRes.data,
                    courses: coursesRes.data,
                    playlists: playlistsRes.data
                });
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoadingUsers(false);
                setLoadingItems(false);
            }
        };

        fetchInitialData();
    }, [authLoading, currentUser]);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleGrantAccess = async () => {
        if (!selectedUser) {
            alert('Please select a student first.');
            return;
        }
        if (!grantItemId) {
            alert('Please select an item to grant access to.');
            return;
        }

        setGrantingAccess(true);
        setSuccessMessage('');
        
        try {
            await api.put(`/users/${selectedUser._id}/access`, {
                itemId: grantItemId,
                type: grantType
            });
            
            // Get item name for success message
            let itemName = '';
            if (grantType === 'course') itemName = availableItems.courses.find(c => c._id === grantItemId)?.title;
            if (grantType === 'quiz') itemName = availableItems.quizzes.find(q => q._id === grantItemId)?.title;
            if (grantType === 'playlist') itemName = availableItems.playlists.find(p => p._id === grantItemId)?.title;

            setSuccessMessage(`Successfully granted ${selectedUser.name} access to ${itemName || 'the selected item'}!`);
            setGrantItemId('');
        } catch (err) {
            alert('Failed to grant access. The student may already have access or an error occurred.');
        } finally {
            setGrantingAccess(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10); // Show max 10 users to keep UI clean

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Key className="w-8 h-8 text-blue-600" />
                        Manual Access
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Explicitly grant students access to premium content.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: User Selection */}
                <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col h-[600px]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-black text-slate-900 mb-4">Step 1: Select Student</h2>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Search by name, email, or mobile..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {loadingUsers ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <User className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No students found.</p>
                            </div>
                        ) : (
                            filteredUsers.map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                                        selectedUser?._id === u._id 
                                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                        : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                                            selectedUser?._id === u._id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                                        }`}>
                                            {u.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${selectedUser?._id === u._id ? 'text-blue-900' : 'text-slate-900'}`}>
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {u.email} • {u.mobile || 'No Mobile'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedUser?._id === u._id && (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Grant Access */}
                <div className={`bg-white border rounded-[1.5rem] p-8 shadow-sm transition-all duration-300 ${
                    selectedUser ? 'border-blue-200 border-2 shadow-blue-100/50 relative' : 'border-slate-200 opacity-60 pointer-events-none'
                }`}>
                    {!selectedUser && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 rounded-[1.5rem] flex items-center justify-center">
                            <p className="text-slate-500 font-bold bg-white px-6 py-3 rounded-full shadow-lg border border-slate-100">
                                Please select a student first
                            </p>
                        </div>
                    )}
                    
                    <h2 className="text-lg font-black text-slate-900 mb-2">Step 2: Grant Content Access</h2>
                    {selectedUser && (
                        <p className="text-sm text-slate-500 mb-8 font-medium">
                            Granting access for <span className="font-bold text-blue-600">{selectedUser.name}</span>
                        </p>
                    )}

                    {loadingItems ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Content Type</label>
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                    {['course', 'quiz', 'playlist'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => { setGrantType(type); setGrantItemId(''); }}
                                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                                grantType === type 
                                                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Select {grantType}
                                </label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
                                    value={grantItemId}
                                    onChange={(e) => setGrantItemId(e.target.value)}
                                >
                                    <option value="" disabled>Choose a {grantType}...</option>
                                    {grantType === 'course' && availableItems.courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                    {grantType === 'quiz' && availableItems.quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                                    {grantType === 'playlist' && availableItems.playlists.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                </select>
                            </div>

                            <div className="pt-6">
                                <button 
                                    onClick={handleGrantAccess}
                                    disabled={grantingAccess || !grantItemId || !selectedUser}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {grantingAccess ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Key className="w-5 h-5" /> Confirm Access</>
                                    )}
                                </button>
                                
                                {successMessage && (
                                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-sm font-bold text-emerald-800">{successMessage}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
