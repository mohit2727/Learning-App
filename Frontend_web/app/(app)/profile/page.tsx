'use client';
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
    const { signOut, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ mobile: '', age: '', city: '', state: '', pincode: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken();
                setAuthToken(token);
                const p = await dataService.getProfile();
                setProfile(p);
                setForm({ mobile: p.mobile || '', age: p.age || '', city: p.city || '', state: p.state || '', pincode: p.pincode || '' });
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [getToken]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getToken();
            setAuthToken(token);
            const updated = await dataService.updateProfile(form);
            setProfile(updated);
            setForm({ mobile: updated.mobile || '', age: updated.age || '', city: updated.city || '', state: updated.state || '', pincode: updated.pincode || '' });
            setShowEdit(false);
        } catch { alert('Failed to update profile.'); }
        finally { setSaving(false); }
    };

    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : profile?.name || 'Student';
    const email = user?.primaryEmailAddress?.emailAddress || profile?.email || '';

    const infoRows = [
        { label: 'Full Name', value: displayName },
        { label: 'Email', value: email },
        { label: 'Mobile', value: profile?.mobile || 'Not provided' },
        { label: 'Age', value: profile?.age || 'Not provided' },
        { label: 'City', value: profile?.city || 'Not provided' },
        { label: 'State', value: profile?.state || 'Not provided' },
        { label: 'Pincode', value: profile?.pincode || 'Not provided' },
    ];

    if (loading) return <div className="flex-1 flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 pt-12 pb-10 px-5 rounded-b-3xl flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3 border-2 border-white/40">
                    <UserCircle size={48} className="text-white" />
                </div>
                <p className="text-white font-bold text-lg">{displayName}</p>
                <p className="text-blue-200 text-sm">{email}</p>
            </div>

            <div className="px-4 pt-5 pb-8 space-y-4">
                {/* Info Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="font-bold text-gray-800 mb-3">Personal Info</p>
                    {infoRows.map((row, i) => (
                        <div key={row.label} className={`flex justify-between py-3 ${i < infoRows.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <span className="text-gray-500 text-sm font-medium">{row.label}</span>
                            <span className="text-gray-800 text-sm font-medium text-right ml-4 max-w-[60%] truncate">{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {[
                        { icon: '✏️', label: 'Edit Profile', action: () => setShowEdit(true) },
                        { icon: '📋', label: 'My Test Attempts', action: () => router.push('/profile/my-tests') },
                        { icon: '📚', label: 'My Enrolled Courses', action: () => router.push('/profile/my-courses') },
                    ].map((opt, i, arr) => (
                        <button key={opt.label} onClick={opt.action} className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <span className="text-xl">{opt.icon}</span>
                            <span className="flex-1 text-left text-gray-800 font-medium">{opt.label}</span>
                            <span className="text-gray-400">›</span>
                        </button>
                    ))}
                </div>

                <button onClick={() => { if (confirm('Are you sure you want to logout?')) signOut(); }} className="w-full border-2 border-gray-300 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors">
                    Log Out
                </button>
            </div>

            {/* Edit Modal */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <p className="text-xl font-bold text-gray-800">Edit Profile</p>
                            <button onClick={() => setShowEdit(false)} className="text-gray-500 font-bold text-lg">✕</button>
                        </div>
                        {[
                            { label: 'Mobile Number', key: 'mobile', type: 'tel' },
                            { label: 'Age', key: 'age', type: 'number' },
                            { label: 'City', key: 'city', type: 'text' },
                            { label: 'State', key: 'state', type: 'text' },
                            { label: 'Pincode', key: 'pincode', type: 'text' },
                        ].map(({ label, key, type }) => (
                            <div key={key} className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                                <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500" />
                            </div>
                        ))}
                        <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold mt-2 mb-4 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
