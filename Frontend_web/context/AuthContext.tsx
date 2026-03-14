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
    refreshDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    dbUser: null,
    loading: true,
    isOnboarded: false,
    logout: async () => { },
    refreshDbUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (firebaseUser: User) => {
        try {
            // Fetch user profile from our backend to get DB-specific data (name, mobile, etc)
            const res = await api.get('/users/profile');
            setDbUser(res.data);
        } catch (error: any) {
            console.error("Failed to fetch user profile from DB", error);
            // If the backend returns 401, it means the user exists in Firebase but not in our DB (deleted)
            if (error.response?.status === 401) {
                console.log("User not found in DB, logging out of Firebase...");
                await auth.signOut();
            }
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Register the token refresher for our Axios client
                setTokenRefresher(() => firebaseUser.getIdToken(true));

                // Set initial token for immediate use
                const token = await firebaseUser.getIdToken();
                setAuthToken(token);

                await fetchProfile(firebaseUser);
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

    const refreshDbUser = async () => {
        if (user) await fetchProfile(user);
    };

    const isOnboarded = !!(dbUser && dbUser.name); // only require name for core access, others can be filled later

    return (
        <AuthContext.Provider value={{ user, dbUser, loading, isOnboarded, logout, refreshDbUser }}>
            {children}
        </AuthContext.Provider>
    );
};
