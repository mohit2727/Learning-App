'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api, { setAuthToken, setTokenRefresher } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    dbUser: any | null;
    loading: boolean;
    isOnboarded: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    dbUser: null,
    loading: true,
    isOnboarded: false,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Register the token refresher for our Axios client
                setTokenRefresher(() => firebaseUser.getIdToken(true));

                // Set initial token for immediate use
                const token = await firebaseUser.getIdToken();
                setAuthToken(token);

                try {
                    // Fetch user profile from our backend to get DB-specific data (name, mobile, etc)
                    const res = await api.get('/users/profile');
                    setDbUser(res.data);
                } catch (error) {
                    console.error("Failed to fetch user profile from DB", error);
                }
            } else {
                setUser(null);
                setDbUser(null);
                setAuthToken(null);
                setTokenRefresher(async () => null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await auth.signOut();
    };

    const isOnboarded = !!(dbUser && dbUser.name && dbUser.age && dbUser.city);

    return (
        <AuthContext.Provider value={{ user, dbUser, loading, isOnboarded, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
