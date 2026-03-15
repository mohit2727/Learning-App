'use client';

import { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}

export default function SignInPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let formattedMobile = mobile.trim();
        if (formattedMobile.length === 10) formattedMobile = '+91' + formattedMobile;

        if (!formattedMobile.startsWith('+')) {
            return setError('Please enter a valid mobile number with country code (e.g. +91 9876543210)');
        }

        setIsProcessing(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedMobile, appVerifier);
            setConfirmationResult(confirmation);
            setStep('OTP');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6 || !confirmationResult) return setError('Please enter a valid 6-digit OTP.');

        setIsProcessing(true);
        try {
            const credential = await confirmationResult.confirm(otp);
            const user = credential.user;
            
            // Get token and set it globally
            const token = await user.getIdToken();
            const { setAuthToken } = await import('@/lib/api');
            setAuthToken(token);

            // Sync user explicitly to trigger auto-creation in backend if missing
            const api = (await import('@/lib/api')).default;
            await api.post('/users/sync');

            // Force refresh dbUser context to get the newly created profile
            // AuthContext's refreshDbUser relies on its own internal state, so reloading here is safer.
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('OTP Verification Error', err);
            setError('Invalid OTP. Please check the code and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
            <div id="recaptcha-container"></div>

            {/* Left side styling - Brand Graphic */}
            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                    <div className="w-32 h-32 relative mb-8 rounded-full bg-white/10 p-4 ring-1 ring-white/30 backdrop-blur-sm">
                        <Image src="/logo.png" alt="Logo" fill sizes="128px" className="object-contain p-2" priority />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Physical Education <br />with Ravina</h1>
                    <p className="text-indigo-100 text-lg">Sign in to access premium courses, tests, and track your fitness and academic progress seamlessly.</p>
                </div>
            </div>

            {/* Right side styling - Sign In Form */}
            <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-24 w-full max-w-lg mx-auto md:max-w-none">
                <div className="flex flex-col items-start w-full">
                    <div className="w-12 h-12 relative mb-6 rounded-lg bg-indigo-600 md:hidden overflow-hidden">
                        <Image src="/logo.png" alt="Logo" fill sizes="48px" className="object-cover" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Let's Sign You In</h2>
                    <p className="text-slate-500 mb-8 font-medium">Please enter your mobile number to continue.</p>

                    {error && (
                        <div className="w-full bg-red-50 text-red-600 text-sm py-3 px-4 rounded-xl border border-red-100 mb-6 font-medium">
                            {error}
                        </div>
                    )}

                    {step === 'MOBILE' ? (
                        <form onSubmit={handleSendOtp} className="w-full space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="mobile" className="text-sm font-semibold text-slate-700 block">Mobile Number</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400 font-medium">+91</span>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        placeholder="9876543210"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-lg font-medium outline-none"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isProcessing || mobile.length < 10}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending OTP...
                                    </span>
                                ) : 'Send Verification Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="w-full space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="otp" className="text-sm font-semibold text-slate-700 block">Verification Code (OTP)</label>
                                <input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-center text-2xl font-bold tracking-[0.2em] outline-none"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                                <p className="text-sm text-slate-500 mt-2 text-center">Code sent to +91 {mobile}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing || otp.length !== 6}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Verifying...
                                    </span>
                                ) : 'Verify & Sign In'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('MOBILE');
                                    setOtp('');
                                }}
                                className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-4"
                            >
                                Change Mobile Number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
