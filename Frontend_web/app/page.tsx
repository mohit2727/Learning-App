'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) return null;

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-6">
            {/* Subtle background blobs */}
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-violet-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-8">
                {/* Logo */}
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-violet-200 ring-1 ring-violet-100">
                    <Image
                        src="/logo.png"
                        alt="Physical Education with Ravina"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        priority
                    />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                        Physical Education<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                            with Ravina
                        </span>
                    </h1>
                    <p className="text-gray-500 text-base font-medium leading-relaxed">
                        Learn, practice, and excel with interactive courses and quizzes.
                    </p>
                </div>

                {/* Sign In Button */}
                <Link
                    href="/sign-in"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-widest py-4 px-8 rounded-2xl shadow-xl shadow-violet-200 transition-all hover:-translate-y-0.5 active:scale-95 text-center"
                >
                    Sign In to Continue
                </Link>

                <p className="text-gray-400 text-xs font-medium">
                    © {new Date().getFullYear()} Physical Education with Ravina
                </p>
            </div>
        </div>
    );
}
