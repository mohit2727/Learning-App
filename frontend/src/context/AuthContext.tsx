import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    User,
    signOut as firebaseSignOut,
    signInWithCredential,
    PhoneAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import apiClient from '../api/apiClient';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithPhone: (phoneNumber: string, recaptchaVerifier: any) => Promise<string>;
    verifyOtp: (verificationId: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Pre-fetch token to ensure interceptors are ready
                try {
                    await firebaseUser.getIdToken(true);
                } catch (error) {
                    console.error("Error refreshing token:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: any) => {
        const phoneProvider = new PhoneAuthProvider(auth);
        return await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
    };

    const verifyOtp = async (verificationId: string, code: string) => {
        const credential = PhoneAuthProvider.credential(verificationId, code);
        await signInWithCredential(auth, credential);
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, signInWithPhone, verifyOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
