'use client';

import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isOnboarded } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/sign-in');
            } else if (!isOnboarded && pathname !== '/onboarding') {
                router.push('/onboarding');
            }
        }
    }, [user, loading, isOnboarded, pathname, router]);

    if (loading || (user && !isOnboarded && pathname !== '/onboarding')) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-16">
                {children}
            </div>
            <BottomNav />
        </div>
    );
}
