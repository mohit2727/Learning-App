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
        if (!loading && user && !isOnboarded && pathname !== '/onboarding') {
            router.push('/onboarding');
        }
    }, [user, loading, isOnboarded, pathname, router]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-16">
                {children}
            </div>
            <BottomNav />
        </div>
    );
}
