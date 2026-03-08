'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileUp,
    Youtube,
    LogOut,
    BookOpen
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@clerk/nextjs';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Quiz Management', href: '/dashboard/quizzes', icon: FileUp },
    { name: 'Playlists & Videos', href: '/dashboard/courses', icon: Youtube },
    { name: 'Announcements', href: '/dashboard/announcements', icon: BookOpen },
];

export default function Sidebar({ isMobileOpen, onMobileClose }: { isMobileOpen?: boolean, onMobileClose?: () => void }) {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        // Clear old manual auth traces
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');

        // Let Clerk handle the real session logout
        await signOut();

        // Force redirect to login page
        window.location.href = '/login';
    };

    return (
        <div className={cn(
            "w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl lg:shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 will-change-transform",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10 mt-2 lg:mt-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="text-white font-black text-xl">R</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">Ravina <span className="text-blue-600">Admin</span></span>
                </div>

                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => onMobileClose && onMobileClose()}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-blue-600 scale-110" : "group-hover:scale-110")} />
                                <span className={cn("font-semibold text-sm", isActive ? "font-bold" : "")}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 px-4 py-3 w-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="font-bold text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
}
