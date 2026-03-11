"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';

// Since we'll update lib/api.ts to have these setters
import { setAuthToken, setTokenRefresher } from '../lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Register the token refresher for our Axios client
                if (setTokenRefresher) {
                    setTokenRefresher(() => firebaseUser.getIdToken(true));
                }

                // Set initial token for immediate use
                const token = await firebaseUser.getIdToken();
                if (setAuthToken) {
                    setAuthToken(token);
                }
            } else {
                setUser(null);
                if (setAuthToken) setAuthToken(null);
                if (setTokenRefresher) setTokenRefresher(async () => null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
