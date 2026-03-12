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

    const [mode, setMode] = useState<'LANDING' | 'AUTH'>('LANDING');

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
            await confirmationResult.confirm(otp);
            router.push('/dashboard');
        } catch (err: any) {
            setError('Invalid OTP. Please check the code and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (mode === 'LANDING') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] opacity-60"></div>

                {/* Header/Nav - Simplified */}
                <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative rounded-xl bg-white shadow-md border border-slate-100 p-1.5 overflow-hidden">
                            <Image src="/logo.png" alt="Logo" fill sizes="40px" className="object-contain p-1" />
                        </div>
                        <span className="font-black text-slate-900 tracking-tight text-xl uppercase">Physical <span className="text-indigo-600">Education</span></span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto text-center relative z-10 -mt-20">
                    <div className="relative mb-12">
                        {/* Orbiting element effect */}
                        <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
                        <div className="w-40 h-40 md:w-56 md:h-56 relative rounded-[3rem] bg-white p-8 border-2 border-white/50 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] overflow-hidden card-hover">
                            <Image src="/logo.png" alt="Logo" fill sizes="(max-width: 768px) 160px, 224px" className="object-contain p-8" priority />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-slate-950 mb-8 tracking-tighter leading-[0.9] md:leading-[0.85]">
                        Physical <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 drop-shadow-sm">Education</span> <br />
                        <span className="text-slate-900">with Ravina</span>
                    </h1>

                    <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mb-12 font-semibold leading-relaxed">
                        The ultimate fitness & academic ecosystem. <br className="hidden md:block" />
                        Master concepts, ace tests, and dominate the leaderboard.
                    </p>

                    <div className="flex flex-col items-center gap-6 w-full max-w-md">
                        <button
                            onClick={() => setMode('AUTH')}
                            className="group w-full relative h-[72px] flex items-center justify-center font-black text-white text-xl uppercase tracking-widest transition-all duration-300 bg-slate-950 rounded-3xl hover:bg-slate-900 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started Now
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={3} />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>

                    {/* Trust/Footer info */}
                    <div className="mt-20 flex flex-col items-center gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm overflow-hidden text-[10px] font-black text-indigo-600">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center shadow-sm text-[10px] font-black text-white">
                                +10K
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                            Trusted by learners worldwide
                        </p>
                    </div>
                </div>

                {/* Animated Bottom Info */}
                <div className="w-full py-10 opacity-30 select-none pointer-events-none">
                    <div className="flex whitespace-nowrap gap-20 animate-marquee uppercase font-black text-8xl md:text-9xl text-slate-100">
                        <span>Physical Fitness</span>
                        <span>Academic Excellence</span>
                        <span>Leadership</span>
                        <span>Progress</span>
                    </div>
                </div>
            </div>
        );
    }

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
