'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User, Calendar, MapPin, Hash, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function OnboardingPage() {
    const { user, dbUser, loading, isOnboarded, refreshDbUser } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        age: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) router.push('/sign-in');
        if (!loading && isOnboarded) router.push('/dashboard');

        if (dbUser) {
            setForm(f => ({
                ...f,
                name: (dbUser.name && dbUser.name !== 'New User') ? dbUser.name : '',
                age: dbUser.age || '',
                city: dbUser.city || '',
                state: dbUser.state || '',
                pincode: dbUser.pincode || ''
            }));
        }
    }, [user, dbUser, loading, isOnboarded, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.age || !form.city) {
            return setError('Please fill in at least Name, Age, and City.');
        }

        setIsSaving(true);
        setError('');

        try {
            const token = await user!.getIdToken();
            setAuthToken(token);
            await dataService.updateProfile(form);
            await refreshDbUser();
            router.push('/dashboard');
        } catch (err) {
            setError('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white text-center relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={100} />
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/30">
                        <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-contain" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">Almost There!</h2>
                    <p className="text-indigo-100 font-medium">Please complete your profile to continue your journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-2">
                            <Hash size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Age</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Age"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                                        value={form.age}
                                        onChange={e => setForm({ ...form, age: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Pincode</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <Hash size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                                        value={form.pincode}
                                        onChange={e => setForm({ ...form, pincode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">City</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                                        value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">State</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="State"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                                        value={form.state}
                                        onChange={e => setForm({ ...form, state: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Saving Profile...' : 'Get Started'}
                    </button>

                    <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                        By continuing, you agree to our Terms and Service.
                    </p>
                </form>
            </div>
        </div>
    );
}
