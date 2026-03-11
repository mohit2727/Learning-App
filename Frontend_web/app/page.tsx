'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Activity, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[120px] opacity-70"></div>
            </div>

            {/* Header/Nav */}
            <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative overflow-hidden rounded-lg bg-indigo-600 shadow-md">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">Ravina App</span>
                </div>
                {!user && !loading && (
                    <Link
                        href="/sign-in"
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2 rounded-full hover:bg-indigo-50"
                    >
                        Log In
                    </Link>
                )}
                {user && !loading && (
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2 rounded-full hover:bg-indigo-50"
                    >
                        Dashboard
                    </Link>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col justify-center items-center z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">

                    {/* Big Logo Graphic Container */}
                    <div className="relative w-40 h-40 md:w-56 md:h-56 bg-white rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 mb-4 group hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-3xl" />
                        <Image
                            src="/logo.png"
                            alt="Physical Education with Ravina Logo"
                            fill
                            className="object-contain p-6 relative z-10 drop-shadow-sm"
                            priority
                        />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            Physical Education <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                with Ravina
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            Your complete learning ecosystem for physical education.
                            Master concepts, take tests, and track your progress with our premium curriculum.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-8">
                        {!user && !loading && (
                            <>
                                <Link
                                    href="/sign-in"
                                    className="group relative flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                                >
                                    <span className="relative z-10">Get Started Now</span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>

                                <Link
                                    href="/sign-in"
                                    className="flex items-center justify-center bg-white text-slate-800 ring-1 ring-slate-200 font-bold text-lg py-4 px-8 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:ring-slate-300 transition-all duration-300"
                                >
                                    I already have an account
                                </Link>
                            </>
                        )}
                        {user && !loading && (
                            <Link
                                href="/dashboard"
                                className="group relative flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10">Go to Dashboard</span>
                                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        )}
                    </div>

                    {/* Features Quick List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-16 pt-16 border-t border-slate-200/60">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900">Comprehensive Courses</h3>
                            <p className="text-sm text-slate-600">Access structured learning materials and video content.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900">Interactive Tests</h3>
                            <p className="text-sm text-slate-600">Evaluate your knowledge with real-time quizzes.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900">Track Progress</h3>
                            <p className="text-sm text-slate-600">Monitor your growth and compete on the leaderboard.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 text-center z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm mt-auto">
                <p className="text-slate-500 text-sm font-medium">
                    © {new Date().getFullYear()} Physical Education with Ravina. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
