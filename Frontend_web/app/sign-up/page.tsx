'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/sign-in');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Redirecting to login...</p>
            </div>
        </div>
    );
}
