import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import TokenProvider from "@/components/TokenProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
    title: "Physical Education with Ravina",
    description: "Learn, practice and grow with Physical Education with Ravina app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
            <html lang="en">
                <body className="app-shell">
                    <div className="app-container">
                        <ErrorBoundary>
                            <TokenProvider />
                            {children}
                        </ErrorBoundary>
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
