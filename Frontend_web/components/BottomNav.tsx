'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, Trophy, User } from 'lucide-react';

const tabs = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/courses', icon: BookOpen, label: 'Courses' },
    { href: '/tests', icon: FileText, label: 'Tests' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
    const pathname = usePathname();
    return (
        <nav className="sticky bottom-0 bg-white border-t border-gray-100 z-50">
            <div className="flex">
                {tabs.map(({ href, icon: Icon, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={href} href={href} className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                            <span className={`text-[10px] font-semibold ${active ? 'text-blue-600' : ''}`}>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
