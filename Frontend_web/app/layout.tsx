import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Physical Education with Ravina | Learn & Excel',
    description: 'Comprehensive platform for learning physical education through interactive courses and quizzes.',
    keywords: 'Physical Education, Ravina, Online Learning, Quizzes, Courses, Sports Science',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="app-shell">
                {/* Razorpay Checkout SDK — loaded globally so window.Razorpay is always available */}
                <Script
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="beforeInteractive"
                />
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

