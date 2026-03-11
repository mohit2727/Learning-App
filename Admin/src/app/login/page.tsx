'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    if (user) {
        router.push('/dashboard');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/30">
                        <span className="text-white font-black text-3xl">R</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Admin Portal</h1>
                    <p className="text-slate-500 font-medium text-lg">Sign in to manage your platform</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-700 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl px-12 py-3.5 text-sm font-medium transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl px-12 py-3.5 text-sm font-medium transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 transition-all py-4 rounded-xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8 font-medium italic">
                    Firebase Protected Admin Access
                </p>
            </div>
        </div>
    );
}
