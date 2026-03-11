import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Physical Education with Ravina',
    description: 'Learn physical education through our comprehensive platform',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="app-shell">
                <AuthProvider>
                    <div className="app-container">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
