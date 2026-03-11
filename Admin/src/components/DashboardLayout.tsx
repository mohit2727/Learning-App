'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    // Close mobile menu when screen resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="text-slate-500 font-medium">Loading your workspace...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
            {/* Mobile Header */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="text-white font-black text-base">R</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 tracking-tight">Ravina <span className="text-blue-600">Admin</span></span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Component with mobile state */}
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto lg:pl-64 pt-16 lg:pt-0">
                <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-10 py-8 lg:py-10 pb-24 lg:pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
