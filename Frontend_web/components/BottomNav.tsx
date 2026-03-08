'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, Trophy, User } from 'lucide-react';

const tabs = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/courses', icon: BookOpen, label: 'Courses' },
    { href: '/tests', icon: FileText, label: 'Tests' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaders' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            <div className="flex items-center px-1">
                {tabs.map(({ href, icon: Icon, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex-1 flex flex-col items-center pt-2 pb-2.5 gap-0.5 relative transition-colors ${active ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-violet-600" />
                            )}
                            <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-violet-50' : ''}`}>
                                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            </div>
                            <span className={`text-[10px] font-semibold leading-none ${active ? 'text-violet-600' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
