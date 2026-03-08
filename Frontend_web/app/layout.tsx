import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import TokenProvider from "@/components/TokenProvider";

export const metadata: Metadata = {
    title: "Ravina App",
    description: "Learn, practice and grow with Ravina App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
            <html lang="en">
                <body className="app-shell">
                    <div className="app-container">
                        <TokenProvider />
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
